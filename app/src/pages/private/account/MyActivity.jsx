import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { activityService } from "../../../services/activities";
import Loading from "../../../components/ui/Loading";
import { LogIn, ShieldAlert } from "lucide-react";
import '../../../styles/account/MyActivity.scss';
import { formattedDate } from "../../../utils";

export default function MyActivity() {
    const { currentUser } = useAuth();
    const [loginLogs, setLoginLogs] = useState([]);
    const [securityLogs, setSecurityLogs] = useState([]);
    const [mergedLogs, setMergedLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [quickRange, setQuickRange] = useState('all');
    const [afterDate, setAfterDate] = useState('');
    const [beforeDate, setBeforeDate] = useState('');

    const quickOptions = [
        { label: "Aujourd'hui", value: 'today' },
        { label: 'Hier', value: 'yesterday' },
        { label: '7 derniers jours', value: '7days' },
        { label: '15 derniers jours', value: '15days' },
        { label: '30 derniers jours', value: '30days' },
        { label: 'Toute la période', value: 'all' },
    ];

    useEffect(() => {
        document.title = 'AdsCity - Mon activité';
    }, []);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await activityService.getUserActivityLogs(
                    currentUser.id,
                    localStorage.getItem('accessToken')
                )

                if (res.success) {
                    setLoginLogs(res.loginLogs || []);
                    setSecurityLogs(res.securityLogs || []);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                throw error;
            } finally {
                setLoading(false);
            }
        }

        if (currentUser) {
            fetchData();
        }
    }, [currentUser]);

    useEffect(() => {
        const formattedSecurity = securityLogs.map((log) => ({
            type: 'security',
            icon: <ShieldAlert size={18} color="red" />,
            message: log.message,
            ip: log.ip,
            city: log.city,
            country: log.country,
            browser: log.browser,
            os: log.os,
            device: log.device,
            createdAt: new Date(log.createdAt),
            severity: log.severity,
        }));

        const formattedLogin = loginLogs.map((log) => ({
            type: 'login',
            icon: <LogIn size={18} color="green" />,
            message: log.reason,
            ip: log.ip,
            city: log.city,
            country: log.country,
            browser: log.browser,
            os: log.os,
            device: log.device,
            createdAt: new Date(log.createdAt),
            status: log.status,
        }));

        const all = [...formattedSecurity, ...formattedLogin].sort(
            (a, b) => b.createdAt - a.createdAt
        );

        setMergedLogs(all);
    }, [loginLogs, securityLogs]);

    const formatDeviceType = (device) => {
        switch(device) {
            case 'desktop':
                return "Ordinateur";
            default:
                return null;
        }
    }

    const getDateRange = (range) => {
        const today = new Date();
        let start = new Date(today);
        let end = new Date(today);

        switch (range) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return { start, end };
            case 'yesterday':
                start.setDate(today.getDate() - 1);
                end.setDate(today.getDate() - 1);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return { start, end };
            case '7days':
                start.setDate(today.getDate() - 6);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return { start, end };
            case '15days':
                start.setDate(today.getDate() - 14);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return { start, end };
            case '30days':
                start.setDate(today.getDate() - 29);
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                return { start, end };
            default:
                return { start: null, end: null };
        }
    };


    const handleQuickSelect = (value) => {
        setQuickRange(value);
        setAfterDate('');
        setBeforeDate('');
        onFilterChange({ quickRange: value, afterDate: '', beforeDate: '' });
    };

    const handleCustomChange = () => {
        setQuickRange('');
        onFilterChange({ quickRange: '', afterDate, beforeDate });
    };

    const onFilterChange = (newFilters) => {
        setQuickRange(newFilters.quickRange);
        setAfterDate(newFilters.afterDate);
        setBeforeDate(newFilters.beforeDate);
    };

    if (loading) return <Loading />

    let filteredLogs = [...mergedLogs];

    if (quickRange && quickRange !== 'all') {
        const { start, end } = getDateRange(quickRange);
        filteredLogs = filteredLogs.filter(log =>
            log.createdAt >= start && log.createdAt <= end
        );
    } else if (afterDate || beforeDate) {
        filteredLogs = filteredLogs.filter(log => {
            const created = log.createdAt;
            if (afterDate && created < new Date(afterDate)) return false;
            if (beforeDate && created > new Date(beforeDate)) return false;
            return true;
        });
    }

    return (
        <div className="my-activity">
            <h2>Mon activité - AdsCity</h2>
            <div>

                <div className="activity-filter">
                    <div className="quick-options">
                        <select name="" id="" value={quickRange} onChange={(e) => handleQuickSelect(e.target.value)}>
                            <option value="">Filtrer par :</option>
                            {quickOptions.map(opt => (
                                <option key={opt.label} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="custom-date">
                        <div className="date-range">
                            <label>Après le :</label>
                            <input
                                type="date"
                                value={afterDate}
                                onChange={(e) => {
                                    setAfterDate(e.target.value);
                                    handleCustomChange();
                                }}
                            />
                        </div>
                        <div className="date-range">
                            <label>Avant le :</label>
                            <input
                                type="date"
                                value={beforeDate}
                                onChange={(e) => {
                                    setBeforeDate(e.target.value);
                                    handleCustomChange();
                                }}
                            />
                        </div>
                    </div>
                </div>

                <ul>
                    {filteredLogs.map((log, i) => (
                        <li key={i} className={`log-item ${log.type}`}>
                            <div className="log-icon">{log.icon}</div>
                            <div className="log-details">
                                <div className="log-message">{log.message}</div>
                                <div className="log-meta">
                                    <span>{formatDeviceType(log.device)} · {log.browser} · {log.os}</span>
                                    <span>{log.city}, {log.country}</span>
                                    <span>{formattedDate(log.createdAt.toLocaleString())}</span>
                                    <span className="ip">IP: {log.ip}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
