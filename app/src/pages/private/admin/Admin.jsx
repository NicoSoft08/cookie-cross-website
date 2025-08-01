import ListingsChart from "../../../components/charts/ListingsChart";
import StatsChart from "../../../components/charts/StatsChart";
import StoresChart from "../../../components/charts/StoresChart";
import UsersChart from "../../../components/charts/UsersChart";
import '../../../styles/admin/Admin.scss';


export default function Admin() {

    return (
        <div className="admin-stats">
            <StatsChart />
            <ListingsChart />
            <UsersChart />
            <StoresChart />
        </div>
    );
};
