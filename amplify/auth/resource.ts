import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */

const ENTRA_ID_METADATA_URL: string =
  process.env.ENTRA_ID_METADATA_URL ||
  "https://login.microsoftonline.com/e7744151-acb7-4516-a9ef-828e5529b311/federationmetadata/2007-06/federationmetadata.xml?appid=3a9131f5-f56a-4d78-a425-45b249d98c3f";

const LOGOUT_URL: string =
  process.env.LOGOUT_URL || "http://localhost:3000/logout";
const CALLBACK_URL: string =
  process.env.CALLBACK_URL || "http://localhost:3000/";

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      saml: {
        name: "MicrosoftEntraIDSAML",
        metadata: {
          metadataType: "URL",
          metadataContent: ENTRA_ID_METADATA_URL,
        },
        attributeMapping: {
          email:
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
        },
      },
      logoutUrls: [LOGOUT_URL],
      callbackUrls: [CALLBACK_URL],
    },
  },
});
