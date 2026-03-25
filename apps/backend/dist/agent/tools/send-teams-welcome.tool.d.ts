export interface SendTeamsWelcomeInput {
    employeeId: string;
    name: string;
    role: string;
    startDate: string;
    channel: string;
}
export interface SendTeamsWelcomeOutput {
    messageTimestamp: string;
    channel: string;
    delivered: boolean;
}
export declare function sendTeamsWelcome(input: SendTeamsWelcomeInput): Promise<SendTeamsWelcomeOutput>;
