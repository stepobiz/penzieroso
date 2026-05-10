const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Penzieroso',
    version: '1.0.0',
    description:
      'Generic key-value storage REST backend. Ogni namespace è protetto da una chiave hashata con bcrypt. Nessuna logica applicativa — solo storage.',
  },
  servers: [{ url: '/data', description: 'Data API' }],
  paths: {
    '/{name}': {
      parameters: [
        {
          name: 'name',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Nome del namespace',
          example: 'myapp',
        },
      ],
      head: {
        summary: 'Verifica esistenza namespace',
        description:
          'Controlla se un namespace esiste senza richiedere la chiave e senza restituire dati. Utile per distinguere prima registrazione da login.',
        operationId: 'headData',
        tags: ['Data'],
        responses: {
          '200': { description: 'Namespace esistente' },
          '404': { description: 'Namespace non trovato' },
        },
      },
      get: {
        summary: 'Leggi payload',
        description: 'Restituisce il payload salvato, previa verifica della chiave.',
        operationId: 'getData',
        tags: ['Data'],
        parameters: [
          {
            name: 'key',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Chiave di accesso al namespace',
          },
        ],
        responses: {
          '200': {
            description: 'Payload trovato',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    payload: { description: 'Dati JSON salvati' },
                    updatedAt: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-01-15T10:30:00.000Z',
                    },
                  },
                },
                example: { payload: { theme: 'dark', lang: 'it' }, updatedAt: '2024-01-15T10:30:00.000Z' },
              },
            },
          },
          '401': {
            description: 'Chiave errata o assente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'wrong key' },
              },
            },
          },
          '404': {
            description: 'Namespace non trovato',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'not found' },
              },
            },
          },
        },
      },
      post: {
        summary: 'Crea o aggiorna namespace',
        description:
          'Prima chiamata: crea il namespace e salva l\'hash bcrypt della chiave. Chiamate successive: verifica la chiave e sovrascrive il payload. Distinguibile da 201 (creazione) vs 200 (aggiornamento).',
        operationId: 'postData',
        tags: ['Data'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PostBody' },
              example: { key: 'secret123', payload: { theme: 'dark', lang: 'it' } },
            },
          },
        },
        responses: {
          '201': {
            description: 'Namespace creato (prima chiamata)',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Ok' },
                example: { ok: true },
              },
            },
          },
          '200': {
            description: 'Payload aggiornato',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Ok' },
                example: { ok: true },
              },
            },
          },
          '401': {
            description: 'Chiave errata',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'wrong key' },
              },
            },
          },
        },
      },
    },
    '/{name}/key': {
      parameters: [
        {
          name: 'name',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Nome del namespace',
          example: 'myapp',
        },
      ],
      put: {
        summary: 'Cambia chiave',
        description: 'Sostituisce la chiave di accesso al namespace verificando prima quella attuale.',
        operationId: 'putKey',
        tags: ['Data'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PutKeyBody' },
              example: { oldKey: 'secret123', newKey: 'newsecret456' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Chiave aggiornata',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Ok' },
                example: { ok: true },
              },
            },
          },
          '401': {
            description: 'Chiave attuale errata',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'wrong key' },
              },
            },
          },
          '404': {
            description: 'Namespace non trovato',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'not found' },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      PostBody: {
        type: 'object',
        required: ['key', 'payload'],
        properties: {
          key: { type: 'string', description: 'Chiave di accesso' },
          payload: { description: 'Qualsiasi valore JSON' },
        },
      },
      PutKeyBody: {
        type: 'object',
        required: ['oldKey', 'newKey'],
        properties: {
          oldKey: { type: 'string', description: 'Chiave attuale' },
          newKey: { type: 'string', description: 'Nuova chiave' },
        },
      },
      Ok: {
        type: 'object',
        properties: {
          ok: { type: 'boolean', example: true },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  },
};

export default spec;
