import OpenAI from 'openai';


interface ChatGPTHelperSettings {
  apiKey: string;
  organisation: string;
  project: string;
}


export class ChatGptHelper {
  private openai: OpenAI|null = null;

  constructor(settings: ChatGPTHelperSettings) {
    this.createOpenAIInstance(settings);
  }

  public async createCompletion(messageOrMessageList: string | string[],
                                model: OpenAI.ChatModel = 'gpt-4o-mini'): Promise<string|null> {
    const messageList = Array.isArray(messageOrMessageList) ? messageOrMessageList : [messageOrMessageList];

    const result = await (this.openai as OpenAI).chat.completions.create({
      model,
      messages: messageList.map(content => ({role: 'user', content})),
      temperature: 0,
      top_p: 0,
    });

    return result.choices[0].message.content;
  }

  private createOpenAIInstance(settings: ChatGPTHelperSettings): void {
    this.openai = new OpenAI(settings);
  }
}
