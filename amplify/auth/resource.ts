import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */

const ENTRA_ID_METADATA_URL: string =
  process.env.ENTRA_ID_METADATA_URL ||
  "https://login.microsoftonline.com/e7744151-acb7-4516-a9ef-828e5529b311/federationmetadata/2007-06/federationmetadata.xml?appid=f9bf9d92-d2e6-4a68-9b89-6a7f4daf9d39";

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
      logoutUrls: ["http://localhost:3000/"],
      callbackUrls: ["http://localhost:3000/"],
    },
  },
});
