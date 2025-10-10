export type Subscription = {
    subscriptionId: string;
    name: string;
    price: number;
    duration: number;
    description: string;
};

export type SubscriptionPayload = {
    items: Subscription[];
};

export type CreateSubscriptionBody = {
    name: string;
    price: number;
    duration: number;
    description: string;
};

export type UpdateSubscriptionBody = CreateSubscriptionBody;
