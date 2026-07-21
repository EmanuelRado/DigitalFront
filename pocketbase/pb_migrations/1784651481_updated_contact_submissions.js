/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_293138627")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions (status)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_293138627")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
