import { prisma } from "@/lib/prisma";

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";
const EXPO_BATCH_SIZE = 100;
const EXPO_REQUEST_TIMEOUT_MS = 15000;

const expoPushTokenPattern =
  /^(?:ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/;

type OfferForNotification = {
  id: string;
  title: string;
  slug: string;
  discountText: string | null;
  isActive: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  pushNotifiedAt: Date | null;
};

type StoredPushSubscription = {
  id: string;
  expoPushToken: string;
};

type ExpoPushTicket =
  | {
      status: "ok";
      id: string;
    }
  | {
      status: "error";
      message?: string;
      details?: {
        error?: string;
      };
    };

type ExpoPushResponse = {
  data?: ExpoPushTicket | ExpoPushTicket[];
  errors?: unknown[];
};

function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }

  return result;
}

function clip(value: string, maxLength: number) {
  const cleanValue = value.trim();

  if (cleanValue.length <= maxLength) {
    return cleanValue;
  }

  return `${cleanValue.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function isOfferVisibleNow(offer: OfferForNotification, now = new Date()) {
  if (!offer.isActive) {
    return false;
  }

  if (offer.startsAt && offer.startsAt > now) {
    return false;
  }

  if (offer.endsAt && offer.endsAt < now) {
    return false;
  }

  return true;
}

async function postExpoMessages(messages: Record<string, unknown>[]) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    EXPO_REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messages),
      signal: controller.signal
    });

    const payload = (await response
      .json()
      .catch(() => null)) as ExpoPushResponse | null;

    if (!response.ok || !payload) {
      throw new Error(`Expo Push Service returned HTTP ${response.status}`);
    }

    const data = Array.isArray(payload.data)
      ? payload.data
      : payload.data
        ? [payload.data]
        : [];

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function isValidExpoPushToken(value: string) {
  return expoPushTokenPattern.test(value.trim());
}

export async function sendOfferPublishedNotification(
  offer: OfferForNotification
) {
  const claimTime = new Date();

  if (offer.pushNotifiedAt || !isOfferVisibleNow(offer, claimTime)) {
    return {
      sent: false,
      reason: "not-eligible" as const,
      subscribers: 0,
      accepted: 0
    };
  }

  const claim = await prisma.offer.updateMany({
    where: {
      id: offer.id,
      pushNotifiedAt: null,
      isActive: true
    },
    data: {
      pushNotifiedAt: claimTime
    }
  });

  if (claim.count !== 1) {
    return {
      sent: false,
      reason: "already-claimed" as const,
      subscribers: 0,
      accepted: 0
    };
  }

  try {
    const subscriptions = (await prisma.pushSubscription.findMany({
      where: {
        offersEnabled: true
      },
      select: {
        id: true,
        expoPushToken: true
      },
      orderBy: {
        updatedAt: "asc"
      }
    })) as StoredPushSubscription[];

    const validSubscriptions = subscriptions.filter((subscription) =>
      isValidExpoPushToken(subscription.expoPushToken)
    );
    const malformedIds = subscriptions
      .filter(
        (subscription) => !isValidExpoPushToken(subscription.expoPushToken)
      )
      .map((subscription) => subscription.id);

    if (malformedIds.length) {
      await prisma.pushSubscription.deleteMany({
        where: {
          id: {
            in: malformedIds
          }
        }
      });
    }

    const body = offer.discountText
      ? `${clip(offer.title, 110)} — ${clip(offer.discountText, 70)}`
      : clip(offer.title, 180);

    let accepted = 0;
    const deviceNotRegisteredIds: string[] = [];

    for (const batch of chunks(validSubscriptions, EXPO_BATCH_SIZE)) {
      const messages = batch.map((subscription) => ({
        to: subscription.expoPushToken,
        sound: "default",
        title: "عرض جديد على طب نت 🎉",
        body,
        priority: "high",
        channelId: "offers",
        ttl: 86400,
        data: {
          url: `/offers?offer=${encodeURIComponent(offer.slug)}`,
          screen: "offers",
          offerSlug: offer.slug
        }
      }));

      const tickets = await postExpoMessages(messages);

      tickets.forEach((ticket, index) => {
        if (ticket.status === "ok") {
          accepted += 1;
          return;
        }

        if (ticket.details?.error === "DeviceNotRegistered") {
          const subscription = batch[index];

          if (subscription) {
            deviceNotRegisteredIds.push(subscription.id);
          }
        }
      });
    }

    if (deviceNotRegisteredIds.length) {
      await prisma.pushSubscription.deleteMany({
        where: {
          id: {
            in: deviceNotRegisteredIds
          }
        }
      });
    }

    return {
      sent: true,
      reason: "sent" as const,
      subscribers: validSubscriptions.length,
      accepted
    };
  } catch (error) {
    await prisma.offer
      .updateMany({
        where: {
          id: offer.id,
          pushNotifiedAt: claimTime
        },
        data: {
          pushNotifiedAt: null
        }
      })
      .catch((resetError) => {
        console.error("Offer push claim reset failed", {
          offerId: offer.id,
          resetError
        });
      });

    throw error;
  }
}

export async function sendOfferPublishedNotificationSafely(
  offer: OfferForNotification
) {
  try {
    return await sendOfferPublishedNotification(offer);
  } catch (error) {
    console.error("Offer push notification failed", {
      offerId: offer.id,
      error
    });

    return {
      sent: false,
      reason: "error" as const,
      subscribers: 0,
      accepted: 0
    };
  }
}
