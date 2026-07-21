import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import {
  createClient,
  type SupabaseClient
} from "@supabase/supabase-js";

loadEnvConfig(
  process.cwd(),
  process.env.NODE_ENV === "development"
);

const DEFAULT_BUCKET = "tibnet-uploads";
const DEFAULT_MIN_AGE_HOURS = 24;
const DEFAULT_LIST_LIMIT = 50;
const LIST_PAGE_SIZE = 1000;
const DELETE_BATCH_SIZE = 100;
const STORAGE_ROOT = "uploads";
const VARIANT_STORAGE_PATH_PATTERN =
  /^uploads\/\d{4}\/\d{2}\/[a-z0-9-]+-(?:original|profile|thumbnail)\.webp$/i;
const LEGACY_STORAGE_PATH_PATTERN =
  /^uploads\/(\d{4})\/(\d{2})\/([a-z0-9]{8})-[a-z0-9]{10,32}\.webp$/i;

type ImageUrl = string | null | undefined;
type Supabase = SupabaseClient;

type StoredObject = {
  path: string;
  size: number;
  updatedAt: string | null;
};

type CliOptions = {
  deleteFiles: boolean;
  help: boolean;
  minAgeHours: number;
  listLimit: number;
  confirmBucket: string | null;
  confirmCount: number | null;
  allowEmptyReferences: boolean;
};

function printHelp() {
  console.log(`
تنظيف صور Supabase غير المستخدمة

المعاينة الآمنة (لا تحذف شيئاً):
  npx tsx scripts/cleanup-orphan-images.ts

الحذف بعد مراجعة نتيجة المعاينة:
  npx tsx scripts/cleanup-orphan-images.ts --delete \\
    --confirm-bucket=tibnet-uploads --confirm-count=عدد_الصور

الخيارات:
  --delete                    تنفيذ الحذف فعلياً
  --confirm-bucket=NAME       تأكيد اسم bucket عند الحذف
  --confirm-count=NUMBER      تأكيد عدد الصور الظاهر بالمعاينة
  --min-age-hours=HOURS       حماية الصور الأحدث من هذا العمر (الافتراضي 24)
  --list-limit=NUMBER         أقصى عدد مسارات يظهر بالتقرير (الافتراضي 50)
  --allow-empty-references    السماح بالحذف إذا لم تجد القاعدة أي رابط صورة
  --help                      عرض هذه التعليمات
`);
}

function parseNonNegativeNumber(value: string, option: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`قيمة ${option} يجب أن تكون رقماً موجباً أو صفراً`);
  }

  return parsed;
}

function parseNonNegativeInteger(value: string, option: string) {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`قيمة ${option} يجب أن تكون عدداً صحيحاً موجباً أو صفراً`);
  }

  return parsed;
}

function parseOptions(args: string[]): CliOptions {
  const options: CliOptions = {
    deleteFiles: false,
    help: false,
    minAgeHours: DEFAULT_MIN_AGE_HOURS,
    listLimit: DEFAULT_LIST_LIMIT,
    confirmBucket: null,
    confirmCount: null,
    allowEmptyReferences: false
  };

  for (const argument of args) {
    if (argument === "--delete") {
      options.deleteFiles = true;
      continue;
    }

    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }

    if (argument === "--allow-empty-references") {
      options.allowEmptyReferences = true;
      continue;
    }

    if (argument.startsWith("--confirm-bucket=")) {
      options.confirmBucket = argument.slice(
        "--confirm-bucket=".length
      );
      continue;
    }

    if (argument.startsWith("--confirm-count=")) {
      options.confirmCount = parseNonNegativeInteger(
        argument.slice("--confirm-count=".length),
        "--confirm-count"
      );
      continue;
    }

    if (argument.startsWith("--min-age-hours=")) {
      options.minAgeHours = parseNonNegativeNumber(
        argument.slice("--min-age-hours=".length),
        "--min-age-hours"
      );
      continue;
    }

    if (argument.startsWith("--list-limit=")) {
      options.listLimit = parseNonNegativeInteger(
        argument.slice("--list-limit=".length),
        "--list-limit"
      );
      continue;
    }

    throw new Error(`خيار غير معروف: ${argument}`);
  }

  return options;
}

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`متغير البيئة ${name} غير موجود`);
  }

  return value;
}

function readConfiguration() {
  const uploadProvider = (
    process.env.UPLOAD_PROVIDER || "local"
  ).toLowerCase();

  if (uploadProvider !== "supabase") {
    throw new Error(
      "هذا السكربت مخصص لـ Supabase. تأكد أن UPLOAD_PROVIDER=supabase"
    );
  }

  requiredEnvironment("DATABASE_URL");

  return {
    supabaseUrl: requiredEnvironment("SUPABASE_URL"),
    serviceRoleKey: requiredEnvironment(
      "SUPABASE_SERVICE_ROLE_KEY"
    ),
    bucket:
      process.env.SUPABASE_STORAGE_BUCKET?.trim() ||
      DEFAULT_BUCKET
  };
}

function normalizeManagedStoragePath(value: string) {
  const normalized = value
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  if (VARIANT_STORAGE_PATH_PATTERN.test(normalized)) {
    return normalized;
  }

  const legacyMatch = normalized.match(
    LEGACY_STORAGE_PATH_PATTERN
  );

  if (!legacyMatch) {
    return null;
  }

  const [, year, month, encodedTimestamp] = legacyMatch;
  const timestamp = Number.parseInt(encodedTimestamp, 36);

  if (!Number.isSafeInteger(timestamp) || timestamp <= 0) {
    return null;
  }

  const createdAt = new Date(timestamp);

  if (
    createdAt.getUTCFullYear() !== Number(year) ||
    createdAt.getUTCMonth() + 1 !== Number(month)
  ) {
    return null;
  }

  return normalized;
}

function decodeManagedPath(value: string) {
  try {
    return normalizeManagedStoragePath(decodeURIComponent(value));
  } catch {
    return null;
  }
}

function storagePathFromUrl(value: ImageUrl, publicRoot: string) {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) {
    return null;
  }

  if (cleanValue.startsWith("/uploads/")) {
    const [pathname] = cleanValue.split(/[?#]/, 1);

    return decodeManagedPath(pathname);
  }

  try {
    const candidateUrl = new URL(cleanValue);
    const publicRootUrl = new URL(publicRoot);
    const rootPath = publicRootUrl.pathname.endsWith("/")
      ? publicRootUrl.pathname
      : `${publicRootUrl.pathname}/`;

    if (
      candidateUrl.origin === publicRootUrl.origin &&
      candidateUrl.pathname.startsWith(rootPath)
    ) {
      const encodedPath = candidateUrl.pathname.slice(
        rootPath.length
      );
      const managedPath = decodeManagedPath(encodedPath);

      if (managedPath) {
        return managedPath;
      }
    }

    // This fallback only retains files. It protects URLs served through a
    // custom domain without making any external URL eligible for deletion.
    const uploadsIndex = candidateUrl.pathname.indexOf("/uploads/");

    if (uploadsIndex >= 0) {
      return decodeManagedPath(
        candidateUrl.pathname.slice(uploadsIndex + 1)
      );
    }
  } catch {
    return null;
  }

  return null;
}

function addManagedReferences(
  target: Set<string>,
  publicRoot: string,
  values: ImageUrl[]
) {
  for (const value of values) {
    const storagePath = storagePathFromUrl(value, publicRoot);

    if (storagePath) {
      target.add(storagePath);
    }
  }
}

async function loadReferencedPaths(
  prisma: PrismaClient,
  publicRoot: string
) {
  const [providers, pharmacies, labs, cosmeticCenters, offers, media] =
    await Promise.all([
      prisma.provider.findMany({
        select: {
          imageUrl: true,
          imageThumbnailUrl: true,
          imageOriginalUrl: true
        }
      }),
      prisma.pharmacy.findMany({
        select: {
          imageUrl: true,
          imageThumbnailUrl: true,
          imageOriginalUrl: true
        }
      }),
      prisma.lab.findMany({
        select: {
          imageUrl: true,
          imageThumbnailUrl: true,
          imageOriginalUrl: true
        }
      }),
      prisma.cosmeticCenter.findMany({
        select: {
          imageUrl: true,
          imageThumbnailUrl: true,
          imageOriginalUrl: true
        }
      }),
      prisma.offer.findMany({
        select: {
          imageUrl: true
        }
      }),
      prisma.media.findMany({
        select: {
          url: true
        }
      })
    ]);

  const references = new Set<string>();

  for (const row of providers) {
    addManagedReferences(references, publicRoot, [
      row.imageUrl,
      row.imageThumbnailUrl,
      row.imageOriginalUrl
    ]);
  }

  for (const row of pharmacies) {
    addManagedReferences(references, publicRoot, [
      row.imageUrl,
      row.imageThumbnailUrl,
      row.imageOriginalUrl
    ]);
  }

  for (const row of labs) {
    addManagedReferences(references, publicRoot, [
      row.imageUrl,
      row.imageThumbnailUrl,
      row.imageOriginalUrl
    ]);
  }

  for (const row of cosmeticCenters) {
    addManagedReferences(references, publicRoot, [
      row.imageUrl,
      row.imageThumbnailUrl,
      row.imageOriginalUrl
    ]);
  }

  addManagedReferences(
    references,
    publicRoot,
    offers.map((row) => row.imageUrl)
  );
  addManagedReferences(
    references,
    publicRoot,
    media.map((row) => row.url)
  );

  return references;
}

function storedObjectSize(metadata: Record<string, unknown> | null) {
  const rawSize = metadata?.size ?? metadata?.contentLength ?? 0;
  const size = Number(rawSize);

  return Number.isFinite(size) && size > 0 ? Math.floor(size) : 0;
}

async function listStoredObjects(
  supabase: Supabase,
  bucketName: string
) {
  const storage = supabase.storage.from(bucketName);
  const pendingFolders = [STORAGE_ROOT];
  const knownFolders = new Set(pendingFolders);
  const objects = new Map<string, StoredObject>();

  while (pendingFolders.length) {
    const folder = pendingFolders.shift();

    if (!folder) {
      continue;
    }

    let offset = 0;

    while (true) {
      const { data, error } = await storage.list(folder, {
        limit: LIST_PAGE_SIZE,
        offset,
        sortBy: {
          column: "name",
          order: "asc"
        }
      });

      if (error) {
        throw new Error(
          `فشل قراءة مجلد ${folder}: ${error.message}`
        );
      }

      if (!data?.length) {
        break;
      }

      for (const item of data) {
        const objectPath = `${folder}/${item.name}`;

        if (item.id === null) {
          if (!knownFolders.has(objectPath)) {
            knownFolders.add(objectPath);
            pendingFolders.push(objectPath);
          }

          continue;
        }

        objects.set(objectPath, {
          path: objectPath,
          size: storedObjectSize(item.metadata),
          updatedAt: item.updated_at || item.created_at
        });
      }

      offset += data.length;
    }
  }

  return Array.from(objects.values()).sort((left, right) =>
    left.path.localeCompare(right.path)
  );
}

function objectTimestamp(value: string | null) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : null;
}

function totalSize(objects: StoredObject[]) {
  return objects.reduce((total, object) => total + object.size, 0);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function printObjectList(objects: StoredObject[], limit: number) {
  if (!objects.length || limit === 0) {
    return;
  }

  console.log("\nالصور المؤهلة للحذف:");

  for (const object of objects.slice(0, limit)) {
    console.log(`- ${object.path} (${formatBytes(object.size)})`);
  }

  if (objects.length > limit) {
    console.log(`... و${objects.length - limit} صورة أخرى`);
  }
}

function buildDeleteCommand(
  bucket: string,
  orphanCount: number,
  options: CliOptions
) {
  return [
    "npx tsx scripts/cleanup-orphan-images.ts",
    "--delete",
    `--confirm-bucket=${bucket}`,
    `--confirm-count=${orphanCount}`,
    `--min-age-hours=${options.minAgeHours}`
  ].join(" ");
}

async function deleteObjects(
  supabase: Supabase,
  bucketName: string,
  objects: StoredObject[]
) {
  const storage = supabase.storage.from(bucketName);
  let deletedCount = 0;

  for (let index = 0; index < objects.length; index += DELETE_BATCH_SIZE) {
    const batch = objects.slice(index, index + DELETE_BATCH_SIZE);
    const { error } = await storage.remove(
      batch.map((object) => object.path)
    );

    if (error) {
      throw new Error(
        `توقف الحذف بعد ${deletedCount} ملف: ${error.message}`
      );
    }

    deletedCount += batch.length;
    console.log(`تم حذف ${deletedCount} من ${objects.length}`);
  }
}

function validateDeleteConfirmation(
  options: CliOptions,
  bucket: string,
  orphanCount: number,
  referenceCount: number,
  managedObjectCount: number
) {
  if (options.confirmBucket !== bucket) {
    throw new Error(
      `تأكيد bucket غير صحيح. استخدم --confirm-bucket=${bucket}`
    );
  }

  if (options.confirmCount !== orphanCount) {
    throw new Error(
      `عدد التأكيد غير مطابق. استخدم --confirm-count=${orphanCount}`
    );
  }

  if (
    referenceCount === 0 &&
    managedObjectCount > 0 &&
    !options.allowEmptyReferences
  ) {
    throw new Error(
      "لم يُعثر على أي رابط صورة في قاعدة البيانات. تأكد من DATABASE_URL، " +
        "وإذا كانت القاعدة فارغة فعلاً أضف --allow-empty-references"
    );
  }
}

async function run(options: CliOptions) {
  const configuration = readConfiguration();
  const supabase = createClient(
    configuration.supabaseUrl,
    configuration.serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
  const publicRoot = supabase.storage
    .from(configuration.bucket)
    .getPublicUrl("").data.publicUrl;
  const prisma = new PrismaClient();

  try {
    console.log(`Bucket: ${configuration.bucket}`);
    console.log(
      `حماية الصور الأحدث من: ${options.minAgeHours} ساعة`
    );
    console.log("جاري فحص قاعدة البيانات وSupabase Storage...");

    const [referencedPaths, storedObjects] = await Promise.all([
      loadReferencedPaths(prisma, publicRoot),
      listStoredObjects(supabase, configuration.bucket)
    ]);

    const managedObjects = storedObjects.filter((object) =>
      Boolean(normalizeManagedStoragePath(object.path))
    );
    const ignoredObjects = storedObjects.length - managedObjects.length;
    const cutoff = Date.now() - options.minAgeHours * 60 * 60 * 1000;
    const recentOrUnknown: StoredObject[] = [];
    const orphanObjects: StoredObject[] = [];

    for (const object of managedObjects) {
      if (referencedPaths.has(object.path)) {
        continue;
      }

      const timestamp = objectTimestamp(object.updatedAt);

      if (timestamp === null || timestamp > cutoff) {
        recentOrUnknown.push(object);
      } else {
        orphanObjects.push(object);
      }
    }

    const existingPaths = new Set(
      managedObjects.map((object) => object.path)
    );
    const referencedFilesInStorage = Array.from(
      referencedPaths
    ).filter((path) => existingPaths.has(path)).length;
    const missingReferencedFiles =
      referencedPaths.size - referencedFilesInStorage;

    console.log("\nنتيجة الفحص:");
    console.log(
      `- ملفات التطبيق في Storage: ${managedObjects.length} (${formatBytes(
        totalSize(managedObjects)
      )})`
    );
    console.log(
      `- ملفات مستخدمة فعلياً: ${referencedFilesInStorage}`
    );
    console.log(
      `- ملفات يتيمة مؤهلة للحذف: ${orphanObjects.length} (${formatBytes(
        totalSize(orphanObjects)
      )})`
    );
    console.log(
      `- ملفات يتيمة محمية لأنها حديثة أو بلا تاريخ: ${recentOrUnknown.length}`
    );
    console.log(`- ملفات بأسماء غير مُدارة تم تجاهلها: ${ignoredObjects}`);

    if (missingReferencedFiles > 0) {
      console.log(
        `- تنبيه: ${missingReferencedFiles} رابط في القاعدة لا يقابله ملف في Storage`
      );
    }

    printObjectList(orphanObjects, options.listLimit);

    if (!options.deleteFiles) {
      console.log("\nوضع المعاينة فقط: لم يتم حذف أي ملف.");

      if (orphanObjects.length) {
        console.log("بعد مراجعة القائمة شغّل:");
        console.log(
          buildDeleteCommand(
            configuration.bucket,
            orphanObjects.length,
            options
          )
        );
      }

      return;
    }

    validateDeleteConfirmation(
      options,
      configuration.bucket,
      orphanObjects.length,
      referencedPaths.size,
      managedObjects.length
    );

    if (!orphanObjects.length) {
      console.log("\nلا توجد صور مؤهلة للحذف.");
      return;
    }

    console.log("\nإعادة فحص المراجع قبل الحذف...");
    const latestReferences = await loadReferencedPaths(
      prisma,
      publicRoot
    );
    const finalOrphans = orphanObjects.filter(
      (object) => !latestReferences.has(object.path)
    );

    if (finalOrphans.length !== orphanObjects.length) {
      throw new Error(
        "تغيّرت مراجع الصور أثناء الفحص. أعد تشغيل المعاينة ولا تحذف بهذه النتيجة"
      );
    }

    await deleteObjects(
      supabase,
      configuration.bucket,
      finalOrphans
    );

    const remainingPaths = new Set(
      (await listStoredObjects(supabase, configuration.bucket)).map(
        (object) => object.path
      )
    );
    const failedPaths = finalOrphans.filter((object) =>
      remainingPaths.has(object.path)
    );

    if (failedPaths.length) {
      throw new Error(
        `تعذر تأكيد حذف ${failedPaths.length} ملف. أعد تشغيل المعاينة`
      );
    }

    console.log(
      `\nاكتمل التنظيف: حُذفت ${finalOrphans.length} صورة بحجم تقريبي ${formatBytes(
        totalSize(finalOrphans)
      )}.`
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const options = parseOptions(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  await run(options);
}

main().catch((error) => {
  console.error(
    "\nفشل تنظيف الصور:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
