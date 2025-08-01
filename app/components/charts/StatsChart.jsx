import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line,
    PieChart, Pie, Cell,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import Loading from '../ui/Loading';
import { statsService } from '../../services/stats';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6', '#8b5cf6', '#ec4899'];


export default function StatsChart() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');

                const res = await statsService.getOverview(token);

                if (res.success) {
                    setData(res.data);
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <Loading />

    if (!data) return <p>Données non disponibles</p>;

    // Bar/Line data
    const chartData = [
        { name: 'Utilisateurs (Total)', value: data.totalUsers },
        { name: 'Utilisateurs Actifs', value: data.activeUsers },
        { name: 'Utilisateurs en ligne', value: data.onlineUsers },
        { name: 'Boutiques (Total)', value: data.totalStores },
        { name: 'Boutiques Actives', value: data.activeStores },
        { name: 'Annonces (Total)', value: data.totalListings },
        { name: 'Annonces Actives', value: data.activeListings },
        { name: 'Nouvelles annonces', value: data.newListingsToday },
    ];

    // Pie chart for user distribution
    const pieUsers = [
        { name: 'Actifs', value: data.activeUsers },
        { name: 'En ligne', value: data.onlineUsers },
        { name: 'Inactifs', value: data.totalUsers - data.activeUsers },
    ];

    // Radar chart data
    const radarData = [
        { metric: 'Utilisateurs', value: data.totalUsers },
        { metric: 'Actifs', value: data.activeUsers },
        { metric: 'En ligne', value: data.onlineUsers },
        { metric: 'Boutiques', value: data.totalStores },
        { metric: 'Annonces', value: data.totalListings },
    ];

    return (
        <div className='stats-charts'>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Répartition globale
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='' style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Évolution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#10b981" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Répartition des utilisateurs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieUsers}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    label
                                >
                                    {pieUsers.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Vue comparative
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="metric" />
                                <PolarRadiusAxis />
                                <Radar name="Statistiques" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
