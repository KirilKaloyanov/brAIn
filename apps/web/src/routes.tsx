// React Router routes (architecture §2.2).
import type { RouteObject } from 'react-router';
import { Chat, NewChat, SignIn } from './screens.js';

export const routes: RouteObject[] = [
  { path: '/sign-in', element: <SignIn /> },
  { path: '/', element: <NewChat /> },
  { path: '/c/:chatId', element: <Chat /> },
];
