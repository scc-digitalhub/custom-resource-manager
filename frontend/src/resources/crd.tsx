import React from 'react';
import {
    Button,
    Datagrid,
    List,
    Loading,
    NumberField,
    Show,
    ShowButton,
    SimpleShowLayout,
    TextField,
    useGetManyReference,
    useShowController,
    useTranslate,
} from 'react-admin';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Typography } from '@mui/material';
import { ShowTopToolbar } from '../components/toolbars';
import { AceEditorField } from '@smartcommunitylab/ra-ace-editor';

export const CrdList = () => (
    <List actions={false}>
        <Datagrid bulkActionButtons={false}>
            <TextField source="spec.names.kind" label="Name" />
            <ShowButton />
        </Datagrid>
    </List>
);

export const CrdShow = () => {
    const translate = useTranslate();
    const { record } = useShowController();
    if (!record) return null;

    return (
        <>
            <Typography
                variant="h4"
                className="login-page-title"
                sx={{ padding: '20px 0px 12px 0px' }}
            >
                {[translate('pages.crd.show.title'), record.id].join(' ')}
            </Typography>
            <Show
                actions={<ShowTopToolbar hasEdit={false} hasDelete={false} />}
            >
                <SimpleShowLayout>
                    <TextField source="metadata.creationTimestamp" />
                    <NumberField source="metadata.generation" />
                    <TextField source="metadata.name" />
                    <TextField source="metadata.resourceVersion" />
                    <TextField source="metadata.uid" />
                    <AceEditorField
                        mode="json"
                        record={{
                            managedFields: JSON.stringify(
                                record.metadata.managedFields
                            ),
                        }}
                        source="managedFields"
                    />
                    <RelatedResources />
                </SimpleShowLayout>
            </Show>
        </>
    );
};

const RelatedResources = () => {
    const translate = useTranslate();
    const { record } = useShowController();

    const sort = { field: 'id', order: 'ASC' };
    const { data, total, isLoading } = useGetManyReference('crs', {
        target: 'crdId',
        id: record.id,
        pagination: { page: 1, perPage: 10 },
        sort: sort,
    });
    if (isLoading) return <Loading />;
    if (!data) return null;
    return total ? (
        <>
            <Datagrid
                data={data}
                total={total}
                isLoading={isLoading}
                bulkActionButtons={false}
                sort={sort}
            >
                <TextField source="id" />
                <TextField source="version" />
                <ShowButton resource="crs" />
            </Datagrid>
            <Button
                label={translate('pages.crd.show.listCrs')}
                startIcon={<VisibilityIcon />}
                href={`${window.location.origin}/${record.id}`}
            ></Button>
        </>
    ) : (
        <Button
            label={translate('pages.crd.show.createSchema')}
            href={`${window.location.origin}/crs/create?crdId=${record.id}`}
        ></Button>
    );
};
