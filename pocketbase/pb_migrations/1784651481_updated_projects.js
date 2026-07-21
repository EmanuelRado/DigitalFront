/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects (slug)",
      "CREATE INDEX IF NOT EXISTS idx_projects_category ON projects (category)",
      "CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_484305853")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
