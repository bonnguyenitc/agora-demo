// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  RtcTokenBuilder,
  RtmTokenBuilder,
  RtcRole,
  RtmRole,
} from "agora-access-token";

export default function handler(req, res) {
  const { id, chanel, role } = req.query;
  const appID = process.env.NEXT_PUBLIC_APP_ID;
  const appCertificate = process.env.NEXT_PUBLIC_APP_CERTIFICATE;

  const role1 = parseInt(role) === 1 ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  const expirationTimeInSeconds = 7200;

  const currentTimestamp = Math.floor(Date.now() / 1000);

  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  // IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.

  // Build token with uid
  const tokenA = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    chanel,
    id,
    role1,
    privilegeExpiredTs
  );
  console.log({ appID, appCertificate, chanel, id, role1, privilegeExpiredTs });
  console.log("Token With Integer Number Uid: " + tokenA);

  //   Build token with user account
  // const tokenB = RtcTokenBuilder.buildTokenWithAccount(
  //   appID,
  //   appCertificate,
  //   chanel,
  //   account,
  //   role,
  //   privilegeExpiredTs
  // );
  // console.log("Token With UserAccount: " + tokenB);
  res.status(200).json({ token: tokenA });
}
