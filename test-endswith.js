try {
  "".endsWith(undefined);
  console.log("endsWith(undefined) is OK");
} catch(e) {
  console.log("endsWith(undefined) error:", e.message);
}

try {
  "".endsWith(null);
  console.log("endsWith(null) is OK");
} catch(e) {
  console.log("endsWith(null) error:", e.message);
}
