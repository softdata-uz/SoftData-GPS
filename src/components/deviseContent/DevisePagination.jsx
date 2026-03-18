import {Pagination} from 'antd';
import {useTranslation} from "react-i18next";




const DevisePagination = (props) => {

    const {
        devisePaginationLimit,
        devisePaginationCurrent,
        devisePaginationOnChange,
        deviseTotal,

    } = props;

    const {t} = useTranslation();

    return <Pagination
        dropdownRender = {false}
        defaultPageSize = {devisePaginationLimit}
        current={devisePaginationCurrent}
        onChange={devisePaginationOnChange}
        total = {deviseTotal}
        showSizeChanger={true}
        pageSize={devisePaginationLimit}
        pageSizeOptions={[15, 50, 100]}
        locale={{ items_per_page: t('sahifa')}}
    />;
}

export default DevisePagination