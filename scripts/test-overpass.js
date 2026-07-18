async function run() {
  const query = `
    [out:json][timeout:25];
    (
      way["building"="commercial"](32.775, -96.805, 32.785, -96.795);
    );
    out geom limit 1;
  `;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "User-Agent": "ServiceAlignment/1.0",
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "data=" + encodeURIComponent(query)
  });
  console.log(res.status, await res.text());
}
run();
