/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1709175608")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX IF NOT EXISTS idx_project_timeline_project ON project_timeline (project)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1709175608")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
