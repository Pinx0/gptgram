type SendMessageCommand = {
  token: string;
  chat_id: number;
  text: string;
  reply_to_message_id?: number;
};
type SendMessageResponse = {
  success: boolean;
  request: SendMessageCommand;
  response: any;
};
export const sendMessage = async (
  requestBody: SendMessageCommand
): Promise<SendMessageResponse> => {
  const { token, chat_id, text, reply_to_message_id } = requestBody;
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text, reply_to_message_id }),
      }
    );
    if (response.status === 200) {
      const data = await response.json();
      return { success: true, request: requestBody, response: data };
    } else {
      const body = await response.text();
      return { success: false, request: requestBody, response: body };
    }
  } catch (error) {
    return { success: false, request: requestBody, response: error };
  }
};
