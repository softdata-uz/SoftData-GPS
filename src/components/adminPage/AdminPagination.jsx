import {Pagination} from 'antd';
import {useTranslation} from "react-i18next";


const AdminPagination = (props) => {

    const {
        adminPaginationLimit,
        adminPaginationCurrent,
        adminPaginationOnChange,
        adminTotal,
    } = props;

    const {t} = useTranslation();

    return <Pagination
        dropdownRender = {false}
        defaultPageSize = {adminPaginationLimit}
        current={adminPaginationCurrent}
        onChange={adminPaginationOnChange}
        total = {adminTotal}
        showSizeChanger={true}
        pageSize={adminPaginationLimit}
        pageSizeOptions={[15, 30, 60]}
        locale={{items_per_page: t('sahifa')}}
    />;
}

export default AdminPagination;