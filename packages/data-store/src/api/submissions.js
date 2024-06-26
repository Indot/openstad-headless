export default {
  fetch: async function ({ projectId }) {
    return [];
  },

  create: async function ({ projectId }, data) {
    delete data.id;

    let url = `/api/project/${projectId}/submission`;
    let method = 'post';
    let body = JSON.stringify(data);

    let newData = await this.fetch(url, { method, body });
    return newData;
  },
};
