# Post likes websocket (frontend)

## Connection

- Transport: Socket.IO
- URL: `${API_BASE_URL}` (same host as your API)
- Path: `/socket.io`
- Auth: send the JWT access token during the handshake

### React/Next example (socket.io-client)

```ts
import { io, type Socket } from 'socket.io-client';

export function createSocket(apiBaseUrl: string, token: string): Socket {
  return io(apiBaseUrl, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: {
      token: `Bearer ${token}`,
    },
  });
}
```

## Join a post room

When you open a post detail screen, join its room so you receive like count updates:

```ts
socket.emit('post:join', { postId });
```

## Like/unlike a post

Emit the `post:like` event with the post id. This toggles like/unlike for the current user.

```ts
const res = await socket.emitWithAck('post:like', { postId });
// res => { postId: string, likeCount: number }
```

If you are not using acknowledgements, you can still listen for the broadcasted update below.

## Listen for updates

The server broadcasts the latest count to everyone currently in the post room:

```ts
socket.on('post:likeCount', (payload: { postId: string; likeCount: number }) => {
  if (payload.postId !== postId) return;
  setLikeCount(payload.likeCount);
});
```

## Notes

- The server disconnects the socket if the token is missing/invalid or the account is suspended/deleted.
- The API also returns `likeCount` on post fetch/list responses, so you can render immediately and then keep it live via websocket.
