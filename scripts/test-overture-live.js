import duckdb from 'duckdb';
const db = new duckdb.Database(':memory:');
const conn = db.connect();

conn.run("INSTALL spatial; LOAD spatial; INSTALL httpfs; LOAD httpfs;", (err) => {
  const sql = `
    SELECT 
      id,
      names.primary as name,
      ST_AsGeoJSON(geometry) as geojson
    FROM read_parquet('s3://overturemaps-us-west-2/release/2024-06-13.0/theme=buildings/type=building/*', hive_partitioning=1)
    WHERE bbox.xmin > -96.81
      AND bbox.xmax < -96.80
      AND bbox.ymin > 32.78
      AND bbox.ymax < 32.79
      AND class = 'commercial'
    LIMIT 3;
  `;
  
  conn.all(sql, (err, res) => {
    if (err) console.error("Query error:", err);
    else console.log("Results:", JSON.stringify(res, null, 2));
    conn.close();
  });
});
