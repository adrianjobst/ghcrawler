// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const auth = require('../middleware/auth');
const express = require('express');
const wrap = require('../middleware/promiseWrap');

let crawlerService = null;
let CrawlerFactory = null;
const router = express.Router();

router.put('/:name', auth.validate, wrap(function* (request, response) {
  const result = yield crawlerService.flushQueue(request.params.name);
  if (!result) {
    return response.sendStatus(404);
  }
  response.sendStatus(200);
}));

router.post('/', auth.validate, wrap(function* (request, response) {
  const queue = CrawlerFactory.addAmqpQueueToCrawler(request.body, crawlerService);

  if (!queue) {
    return response.sendStatus(404);
  }
  response.sendStatus(201);
}));

router.delete('/', auth.validate, wrap(function* (request, response) {
  const success = CrawlerFactory.deleteAmqpQueueFromCrawler(request.body, crawlerService);

  if (!success) {
    return response.sendStatus(404);
  }
  response.sendStatus(201);
}));

router.get('/:name/info', auth.validate, wrap(function* (request, response) {
  let info = null;
  try {
    info = yield crawlerService.getQueueInfo(request.params.name);
  } catch (error) {
  }
  if (!info) {
    return response.sendStatus(404);
  }
  response.json(info);
}));

function setup(service, factory) {
  crawlerService = service;
  CrawlerFactory = factory
  return router;
}
module.exports = setup;