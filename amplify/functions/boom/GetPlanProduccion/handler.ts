import msql from "mssql";

export const handler = async (event: any) => {
    const sqlConf = {
        user: "divecoadm",
        password: "J$YSAc@@gm44ExB",
        server: "divecosqlserver.database.windows.net",
        database: "STGDiveco",
        options: {
            encrypt: true,
        },
    }

    try {
        const pool = new msql.ConnectionPool(sqlConf);
        await pool.connect();
        const result = await pool.request().query("SELECT * FROM dbo.PlanProduccion");
        console.log(result);
        pool.close();
    } catch (error) {
        console.error(error);
        throw new Error("Failed to connect to SQL Server");
    }
}