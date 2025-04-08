class UnAuthorizedResponse extends Response {
  constructor({
    error,
    authEndpoint,
  }: {
    error?: string;
    authEndpoint?: string;
  }) {
    super(JSON.stringify({ error: error || "No access token found" }), {
      status: 401,
      headers: {
        "WWW-Authenticate": "Bearer",
        ...(authEndpoint && { "auth-endpoint": authEndpoint }),
        "Content-Type": "application/json",
      },
    });
  }
}

export { UnAuthorizedResponse };
