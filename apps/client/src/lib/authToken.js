// Module-level access-token store. Lives outside React so the Axios interceptor
// (which runs outside the component tree) can read it. AuthContext (Task 2-02)
// is the only writer; nothing else should call setAccessToken/clearAccessToken.

let accessToken = null

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token) {
  accessToken = token
}

export function clearAccessToken() {
  accessToken = null
}
