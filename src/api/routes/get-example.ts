export const handler = () => {
  return new Promise((resolve) =>
    resolve({
      isBase64Encoded: false,
      body: JSON.stringify({ message: "This is a secret message." }),
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
    })
  );
};
