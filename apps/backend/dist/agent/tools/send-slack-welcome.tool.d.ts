export interface SendSlackWelcomeInput {
    employeeId: string;
    name: string;
    role: string;
    startDate: string;
    channel: string;
}
export interface SendSlackWelcomeOutput {
    timestamp: string;
    channel: string;
    ok: boolean;
}
export declare function sendSlackWelcome(input: SendSlackWelcomeInput): Promise<SendSlackWelcomeOutput>;
