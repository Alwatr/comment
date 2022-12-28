import {config, logger} from '../config.js';
import {nanoServer} from '../lib/nano-server.js';
import {storageClient} from '../lib/storage.js';
import {Message} from '../lib/type.js';

import type {AlwatrConnection} from '@alwatr/nano-server';
import type {AlwatrServiceResponse} from '@alwatr/type';

nanoServer.route('PATCH', '/', setComment);

async function setComment(connection: AlwatrConnection): Promise<AlwatrServiceResponse> {
  logger.logMethod('setComment');

  connection.requireToken(config.nanoServer.accessToken);

  const params = connection.requireQueryParams<{storage: string}>({storage: 'string'});

  const bodyJson = await connection.requireJsonBody<Message>();

  bodyJson.id ??= 'auto_increment';

  // check reply id exists
  // if (bodyJson.replyId !== undefined && !(await storage.has(bodyJson.replyId, params.storage))) {
  //   delete bodyJson.replyId;
  // }

  try {
    return {
      ok: true,
      data: await storageClient.set(bodyJson, params.storage),
    };
  }
  catch (_err) {
    const err = _err as Error;
    logger.error('setComment', err.message || 'storage_error', err);
    return {
      ok: false,
      statusCode: 500,
      errorCode: 'storage_error',
      meta: {
        name: err.name,
        message: err.message,
        cause: err.cause,
      },
    };
  }
}
