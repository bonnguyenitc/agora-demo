// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { RtmTokenBuilder, RtmRole } from "agora-access-token";

export default function handler(req, res) {
  const { id } = req.query;
  const appID = process.env.NEXT_PUBLIC_APP_ID;
  const appCertificate = process.env.NEXT_PUBLIC_APP_CERTIFICATE;

  const expirationTimeInSeconds = 7200;

  const currentTimestamp = Math.floor(Date.now() / 1000);

  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const tokenA = RtmTokenBuilder.buildToken(
    appID,
    appCertificate,
    id,
    RtmRole.Rtm_User,
    privilegeExpiredTs
  );

  console.log("Token ... : " + tokenA);

  res.status(200).json({ token: tokenA });
}
