import { Buffer } from 'buffer';
import { stringify } from 'querystring';
import { fetchUtils, DataProvider } from 'ra-core';
import jsonServerProvider from 'ra-data-json-server';
import { Options } from 'react-admin';

const fetchJson = (url: string, options: Options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }

    const encodedCredentials = Buffer.from(process.env.REACT_APP_BASIC_USERNAME + ':' + process.env.REACT_APP_BASIC_PASSWORD, 'binary').toString('base64');
    options.user = {
        authenticated: true,
        token: 'Basic ' + encodedCredentials
    };

    /*options.user = {
        authenticated: true,
        token: 'Bearer ' + process.env.REACT_APP_TOKEN
    };*/

    return fetchUtils.fetchJson(url, options);
};

const dataProvider = (baseUrl: string, httpClient = fetchJson): DataProvider => {
    const apiUrl = baseUrl + '/api';
    const provider = jsonServerProvider(apiUrl, httpClient);

    return {
        getList: (resource, params) => {
            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            const query = {
                sort: field + ',' + order,
                page: page - 1,
                size: perPage,
            };
            const url = `${apiUrl}/${resource}?${stringify(query)}`;

            return httpClient(url).then(({ headers, json }) => {
                console.log(json)
                if (!json.content) {
                    throw new Error('the response must match page<> model');
                }
                return {
                    data: json.content,
                    total: parseInt(json.totalElements, 10),
                };
            });
        },
        getOne: (resource, params) => provider.getOne(resource, params),
        getMany: (resource, params) => provider.getMany(resource, params),
        getManyReference: (resource, params) => {
            const url = `${apiUrl}/${resource}`;

            return httpClient(url).then(({ headers, json }) => {
                if (!json.content) {
                    throw new Error('the response must match page<> model');
                }
                return {
                    data: json.content,
                    total: parseInt(json.totalElements, 10),
                };
            });
        },
        update: (resource, params) => provider.update(resource, params),
        updateMany: (resource, params) => provider.updateMany(resource, params),
        create: (resource, params) => provider.create(resource, params),
        delete: (resource, params) => provider.delete(resource, params),
        deleteMany: (resource, params) =>
            Promise.all(
                params.ids.map(id =>
                    httpClient(`${apiUrl}/${resource}/${id}`, {
                        method: 'DELETE',
                    })
                )
            ).then(responses => ({ data: responses.map(({ json }) => json) })),
    };
};

export default dataProvider;