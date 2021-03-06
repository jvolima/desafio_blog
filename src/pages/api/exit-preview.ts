/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

export default async (req, res) => {
  // Exit the current user from "Preview Mode". This function accepts no args.
  res.clearPreviewData();

  res.writeHead(307, { Location: '/' });
  res.end();
};
