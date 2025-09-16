import { MongoClient, ServerApiVersion } from "mongodb";

export default defineEventHandler(async (event) => {
  const uri =
    "mongodb+srv://jonhathanrodas:9ERaTodZXKRGPYIW@diveco.9wqf5fa.mongodb.net/?retryWrites=true&w=majority&appName=Diveco";

  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    const db = client.db("users_sap");
    const collection = db.collection("users_sap");
    const users = await collection.find({}).toArray();

    // Filtrar duplicados tomando en cuenta correo, usuario y cod_personal
    const uniqueUsers = users.filter(
      (user, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.correo === user.correo &&
            t.usuario === user.usuario &&
            t.cod_personal === user.cod_personal,
        ),
    );

    return {
      message: "Success",
      data: uniqueUsers,
      status: 200,
      count: uniqueUsers.length,
    };
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
});
