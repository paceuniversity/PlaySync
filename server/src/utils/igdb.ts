let accessToken: string | null = null;
let tokenExpiresAt = 0;

export async function fetchAccessToken(): Promise<string> {
  const now = Date.now();
  if (accessToken && now < tokenExpiresAt) {
    return accessToken;
  }

  const client_id = process.env.CLIENT_ID!;
  const client_secret = process.env.CLIENT_SECRET!;
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`,
    { method: 'POST' }
  );
  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000 - 60 * 1000;
  return accessToken!;
}
