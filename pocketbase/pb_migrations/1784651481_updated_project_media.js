/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2421003747")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE INDEX IF NOT EXISTS idx_project_media_project ON project_media (project)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2421003747")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
