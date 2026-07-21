/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "",
    "deleteRule": "",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_2442875294",
        "hidden": false,
        "id": "relation3343123541",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "client",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "select1274393332",
        "maxSelect": 1,
        "name": "plan_name",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "Essential €25/mo",
          "Active €55/mo",
          "Growth €120/mo"
        ]
      },
      {
        "hidden": false,
        "id": "number156302161",
        "max": null,
        "min": null,
        "name": "monthly_price",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "select1054492236",
        "maxSelect": 1,
        "name": "billing_status",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "active",
          "overdue",
          "cancelled"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text48433495",
        "max": 0,
        "min": 0,
        "name": "next_billing_date",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text18589324",
        "max": 0,
        "min": 0,
        "name": "notes",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      }
    ],
    "id": "pbc_3980638064",
    "indexes": [
      "CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions (client)",
      "CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (billing_status)"
    ],
    "listRule": "",
    "name": "subscriptions",
    "system": false,
    "type": "base",
    "updateRule": "",
    "viewRule": ""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3980638064");

  return app.delete(collection);
})
