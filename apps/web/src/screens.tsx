// Placeholder screens; each is replaced by its module (session, chat) in a later task.
import { useParams } from 'react-router';

export function SignIn() {
  return <h1>Sign in</h1>;
}

export function NewChat() {
  return <h1>New chat</h1>;
}

export function Chat() {
  const { chatId } = useParams();
  return <h1>Chat {chatId}</h1>;
}
