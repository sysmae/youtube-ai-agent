export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL, // env.local에 저장하는게 아니라 convex 의 환경변수에 저장해야함
      applicationID: 'convex',
    },
  ],
}
