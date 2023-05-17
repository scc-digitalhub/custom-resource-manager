import React, { useEffect, useState } from 'react';
import './App.css';
import appDataProvider from './dataProvider';
import { BrowserRouter } from 'react-router-dom';
import {
    AdminContext,
    AdminUI,
    Loading,
    Resource,
    defaultI18nProvider,
    defaultTheme,
    localStorageStore,
    useDataProvider,
    useStore,
} from 'react-admin';
import {
    SchemaList,
    SchemaEdit,
    SchemaCreate,
    SchemaShow,
} from './resources/crs';
import { CrdList, CrdShow } from './resources/crd';
import { View, fetchViews } from './resources';
import { updateCrdIds } from './utils';
import authProvider from './authProvider';
import { SSOLogin } from './components/SSOLogin';

const API_URL: string = process.env.REACT_APP_API_URL as string;

const dataProvider = appDataProvider(API_URL);
const store = localStorageStore();

const theme = {
    ...defaultTheme,
    sidebar: {
        width: 320, // The default value is 240
    },
};

function App() {
    return (
        <BrowserRouter>
            <AdminContext
                dataProvider={dataProvider}
                authProvider={authProvider}
                i18nProvider={defaultI18nProvider}
                store={store}
                theme={theme}
            >
                <DynamicAdminUI />
            </AdminContext>
        </BrowserRouter>
    );
}

function DynamicAdminUI() {
    const [views, setViews] = useState<View[]>([]);
    const dataProvider = useDataProvider();
    const [crdIds, setCrdIds] = useStore<string[]>('crdIds', []);

    useEffect(() => {
        //fetch and store
        // dataProvider.fetchResources().then((res: any) => {
        //     console.log('in callback');
        //     setCrdIds(res);
        // });
        updateCrdIds(dataProvider, setCrdIds);
    }, [dataProvider, setCrdIds]);

    if (
        views.length !== crdIds.length ||
        !views.every((s: View) => crdIds.includes(s.key))
    ) {
        setViews(fetchViews(crdIds));
    }

    return (
        <AdminUI ready={Loading} loginPage={SSOLogin} requireAuth>
            <Resource
                name="crs"
                list={SchemaList}
                edit={SchemaEdit}
                create={SchemaCreate}
                show={SchemaShow}
                options={{ label: 'Schemas' }}
            />
            <Resource
                name="crd"
                list={CrdList}
                show={CrdShow}
                options={{ label: 'CRDs' }}
                recordRepresentation="id"
            />
            {views.map((v: any) => (
                <Resource
                    name={v.name}
                    options={{ label: v.name }}
                    key={v.key}
                    list={v.list}
                    show={v.show}
                    create={v.create}
                    edit={v.edit}
                    icon={v.icon}
                />
            ))}
        </AdminUI>
    );
}

export default App;
