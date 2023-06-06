import {
    Datagrid,
    EditButton,
    List,
    ShowButton,
    TextField,
    Show,
    SimpleShowLayout,
    DeleteWithConfirmButton,
    useShowController,
    BooleanField,
    Create,
    SimpleForm,
    TextInput,
    useResourceContext,
    required,
    BooleanInput,
    Edit,
    useEditController,
    useGetList,
    Loading,
    useTranslate,
    Button,
} from 'react-admin';
import { View } from './index';
import { formatArray, parseArray } from '../utils';
import { ViewToolbar } from '../components/ViewToolbar';
import {
    CreateTopToolbar,
    EditTopToolbar,
    ListTopToolbar,
    ShowTopToolbar,
} from '../components/toolbars';
import { ApiVersionInput, KindInput, SimplePageTitle } from './cr';
import { Typography } from '@mui/material';
import { CR_POSTGRES_USERS } from './cr.postgresusers.db.movetokube.com';

export const CR_POSTGRES_DB = 'postgres.db.movetokube.com';

const CrCreate = () => {
    const crdId = useResourceContext();

    return (
        <>
            <SimplePageTitle
                pageType="create"
                crName={`${CR_POSTGRES_DB}.names.singular`}
            />
            <Create redirect="list" actions={<CreateTopToolbar />}>
                <SimpleForm>
                    {crdId && (
                        <ApiVersionInput
                            crdId={crdId}
                            sx={{ display: 'none' }}
                        />
                    )}
                    {crdId && (
                        <KindInput crdId={crdId} sx={{ display: 'none' }} />
                    )}
                    <TextInput source="metadata.name" validate={required()} />
                    <TextInput source="spec.database" validate={required()} />
                    <BooleanInput source="spec.dropOnDelete" />
                    <TextInput
                        fullWidth
                        source="spec.extensions"
                        format={formatArray}
                        parse={parseArray}
                    />
                    <TextInput source="spec.masterRole" />
                    <TextInput
                        fullWidth
                        source="spec.schemas"
                        format={formatArray}
                        parse={parseArray}
                    />
                </SimpleForm>
            </Create>
        </>
    );
};

const CrEdit = () => {
    const { record } = useEditController();
    if (!record) return null;

    return (
        <>
            <SimplePageTitle
                pageType="edit"
                crName={`${CR_POSTGRES_DB}.names.singular`}
                crId={record.spec.database}
            />
            <Edit actions={<EditTopToolbar />}>
                <SimpleForm toolbar={<ViewToolbar />}>
                    <TextInput source="spec.database" validate={required()} />
                    <BooleanInput source="spec.dropOnDelete" />
                    <TextInput
                        fullWidth
                        source="spec.extensions"
                        format={formatArray}
                        parse={parseArray}
                    />
                    <TextInput source="spec.masterRole" />
                    <TextInput
                        fullWidth
                        source="spec.schemas"
                        format={formatArray}
                        parse={parseArray}
                    />
                </SimpleForm>
            </Edit>
        </>
    );
};

const CrList = () => {
    return (
        <>
            <SimplePageTitle
                pageType="list"
                crName={`${CR_POSTGRES_DB}.names.plural`}
            />
            <List actions={<ListTopToolbar />}>
                <Datagrid>
                    <TextField source="id" />
                    <TextField source="spec.database" />
                    <EditButton />
                    <ShowButton />
                    <DeleteWithConfirmButton />
                </Datagrid>
            </List>
        </>
    );
};

const CrShow = () => {
    const { record } = useShowController();
    if (!record) return null;

    return (
        <>
            <SimplePageTitle
                pageType="show"
                crName={`${CR_POSTGRES_DB}.names.singular`}
                crId={record.spec.database}
            />
            <Show actions={<ShowTopToolbar />}>
                <SimpleShowLayout>
                    <TextField source="spec.database" />
                    <BooleanField source="spec.dropOnDelete" />
                    <TextField source="spec.extensions" />
                    <TextField source="spec.masterRole" />
                    <TextField source="spec.schemas" />
                    <PostgresUsers />
                </SimpleShowLayout>
            </Show>
        </>
    );
};

const PostgresUsers = () => {
    const translate = useTranslate();
    const { record } = useShowController();

    const sort = { field: 'id', order: 'ASC' };
    const { data, total, isLoading } = useGetList(CR_POSTGRES_USERS, {
        pagination: { page: 1, perPage: 1000 },
        sort: sort,
    });

    if (isLoading) return <Loading />;
    if (!data) return null;

    const dbUsers = data.filter(
        (user: any) => user.spec.database === record.metadata.name
    );

    return (
        <>
            <Typography variant="h6">
                {translate(`pages.cr.${CR_POSTGRES_DB}.users.title`)}
            </Typography>
            {dbUsers.length > 0 && (
                <Datagrid
                    data={dbUsers}
                    total={total}
                    isLoading={isLoading}
                    sort={sort}
                >
                    <TextField
                        source="id"
                        label={`pages.cr.${CR_POSTGRES_DB}.users.fields.id`}
                    />
                    <TextField
                        source="spec.role"
                        label={`pages.cr.${CR_POSTGRES_DB}.users.fields.role`}
                    />
                    <TextField
                        source="spec.privileges"
                        label={`pages.cr.${CR_POSTGRES_DB}.users.fields.privileges`}
                    />
                    <TextField
                        source="spec.secretName"
                        label={`pages.cr.${CR_POSTGRES_DB}.users.fields.secretName`}
                    />
                    <EditButton resource={CR_POSTGRES_USERS} />
                    <ShowButton resource={CR_POSTGRES_USERS} />
                    <DeleteWithConfirmButton
                        redirect={false}
                        resource={CR_POSTGRES_USERS}
                    />
                </Datagrid>
            )}
            <Button
                label={`pages.cr.${CR_POSTGRES_DB}.users.createButton`}
                href={`${window.location.origin}/${CR_POSTGRES_USERS}/create?db=${record.metadata.name}`}
            ></Button>
        </>
    );
};

const CustomView: View = {
    key: CR_POSTGRES_DB,
    name: 'Postgres',
    list: CrList,
    show: CrShow,
    create: CrCreate,
    edit: CrEdit,
};

export default CustomView;
