import './App.css';
import appDataProvider from './providers/dataProvider';
import { BrowserRouter } from 'react-router-dom';
import {
    AdminContext,
    AdminUI,
    Loading,
    Resource,
    defaultTheme,
    localStorageStore,
} from 'react-admin';
import {
    SchemaList,
    SchemaEdit,
    SchemaCreate,
    SchemaShow,
} from './resources/crs';


import Login from './pages/Login';
import { useUpdateCrdIds } from './hooks/useUpdateCrdIds';
import { i18nProvider } from './providers/i18nProvider';

import SettingsIcon from '@mui/icons-material/Settings';
import LinkIcon from '@mui/icons-material/Link';
import AppIcon from '@mui/icons-material/Apps';
import AlbumIcon from '@mui/icons-material/Album';
import KeyIcon from '@mui/icons-material/Key';
import ModelTraininigIcon from '@mui/icons-material/ModelTraining';

import MyLayout from './Layout';
import AppDashboard from './pages/Dashboard';
import { CrdShow } from './resources/crd';
import { useContext, useState } from 'react';
import { View, ViewsContext, fetchViews } from './resources';

//import config
import { Config } from './providers/configProvider';
import { buildAuthProvider } from './providers/authProvider';
import crPostgres from './resources/custom/cr.postgres.db.movetokube.com';
import crPostgresUsers from './resources/custom/cr.postgresusers.db.movetokube.com';
import crApiGateways from './resources/custom/cr.apigws.operator.scc-digitalhub.github.io';
import crPostgrest from './resources/custom/cr.postgrests.operator.postgrest.org';
import crDremiorest from './resources/custom/cr.dremiorestservers.operator.dremiorestserver.com';
import { httpClientProvider } from './providers/httpClientProvider';

import { K8SDeploymentList, K8SDeploymentShow } from './resources/k8s/k8s_deployment';
import { K8SPvcCreate, K8SPvcList, K8SPvcShow } from './resources/k8s/k8s_pvc';
import { K8SServiceList, K8SServiceShow } from './resources/k8s/k8s_service';
import { K8SSecretCreate, K8SSecretList, K8SSecretShow } from './resources/k8s/k8s_secret';
import { K8SJobList, K8SJobShow } from './resources/k8s/k8s_job';

console.log('Config', Config);

//build providers
const authProvider = buildAuthProvider(Config);

//build http client for provider
const httpClient = httpClientProvider(authProvider);
const dataProvider = appDataProvider(Config.application.apiUrl, httpClient);
const store = localStorageStore();

const customViews: { [index: string]: View } = {
    'postgres.db.movetokube.com': crPostgres,
    'postgresusers.db.movetokube.com': crPostgresUsers,
    'apigws.operator.scc-digitalhub.github.io': crApiGateways,
    'postgrests.operator.postgrest.org': crPostgrest,
    'dremiorestservers.operator.dremiorestserver.com': crDremiorest    
};

//theming
export const themeOptions = {
    ...defaultTheme,
    palette: {
        secondary: {
            main: '#204372',
        },
    },
    sidebar: {
        width: 320, // The default value is 240
    },
};

function App() {
    return (
        <BrowserRouter basename={Config.application.contextPath}>
            <AdminContext
                dataProvider={dataProvider}
                authProvider={authProvider}
                i18nProvider={i18nProvider}
                store={store}
                theme={themeOptions}
            >
                <DynamicAdminUI />
            </AdminContext>
        </BrowserRouter>
    );
}

function DynamicAdminUI() {
    const [views, setViews] = useState<View[]>([]);
    const { crdIds } = useUpdateCrdIds();


    const viewsContext = useContext(ViewsContext);

    if (crdIds.length === 0 && views.length > 0) {
        setViews([]);
    } else {
        for (const crdId of crdIds) {
            try {
                if (
                    crdId in customViews &&
                    !viewsContext.list().some(v => v.key === crdId)
                ) {
                    viewsContext.put(customViews[crdId]);
                }
            } catch (error) {
                console.log('No custom view for', crdId);
            }
        }
        if (
            views.length !== crdIds.length ||
            !views.every((s: View) => crdIds.includes(s.key))
        ) {
            setViews(fetchViews(crdIds));
        }
    }

    return (
        <AdminUI
            ready={Loading}
            dashboard={AppDashboard}
            loginPage={Login}
            layout={MyLayout}
            requireAuth={true}
        >
            {views.map((v: any) => (
                <Resource
                    name={v.key}
                    options={{ label: v.name }}
                    key={v.key}
                    list={v.list}
                    show={v.show}
                    create={v.create}
                    edit={v.edit}
                    icon={v.icon}
                />
            ))}
            <Resource
                name="crs"
                list={SchemaList}
                edit={SchemaEdit}
                create={SchemaCreate}
                show={SchemaShow}
                icon={SettingsIcon}
            />
            <Resource name="crd" show={CrdShow} recordRepresentation="id" />
            <Resource
                name="k8s_service"
                list={K8SServiceList}
                show={K8SServiceShow}
                icon={LinkIcon}
            />
            <Resource
                name="k8s_deployment"
                list={K8SDeploymentList}
                show={K8SDeploymentShow}
                icon={AppIcon}
            />
            <Resource
                name="k8s_job"
                list={K8SJobList}
                show={K8SJobShow}
                icon={ModelTraininigIcon}
            />
            <Resource
                name="k8s_pvc"
                create={K8SPvcCreate}
                list={K8SPvcList}
                show={K8SPvcShow}
                icon={AlbumIcon}
            />
            <Resource
                name="k8s_secret"
                create={K8SSecretCreate}
                list={K8SSecretList}
                show={K8SSecretShow}
                icon={KeyIcon}
            />
        </AdminUI>
    );
}

export default App;
