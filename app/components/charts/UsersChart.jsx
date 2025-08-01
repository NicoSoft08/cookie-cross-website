import { useEffect, useState } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip,
    LineChart, Line,
    PieChart, Pie, Cell,
    ResponsiveContainer,
} from 'recharts';
import { statsService } from '../../services/stats';
import Loading from '../ui/Loading';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

export default function UsersChart() {
    const [userRegistrations, setUserRegistrations] = useState([]);
    const [userRoles, setUserRoles] = useState([]);
    const [userActivity, setUserActivity] = useState([]);
    const [range, setRange] = useState('daily') // 'daily' | 'weekly' | 'monthly'

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');

                const [
                    userRegistrationsRes,
                    userRolesRes,
                    userActivityRes,
                ] = await Promise.all([
                    statsService.getUsersByRegistration(token, range),
                    statsService.getUsersByRole(token),
                    statsService.getUsersByActivityStatus(token),
                ]);
                setUserRegistrations(userRegistrationsRes.data);
                setUserRoles(userRolesRes.data);
                setUserActivity(userActivityRes.data);
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [range]);

    if (loading) return <Loading />

    return (
        <div className='users-charts'>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Nouveaux utilisateurs par mois
                    </CardTitle>
                    <select value={range} onChange={e => setRange(e.target.value)}>
                        <option value="daily">Jour</option>
                        <option value="weekly">Semaine</option>
                        <option value="monthly">Mois</option>
                    </select>
                </CardHeader>
                <CardContent>
                    <section style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <LineChart data={userRegistrations}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#8884d8" />
                            </LineChart>
                        </ResponsiveContainer>
                    </section>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Répartition par rôle
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <section style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={userRoles} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={100} label>
                                    {userRoles.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </section>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Utilisateurs actifs/inactifs
                    </CardTitle>
                    <select value={range} onChange={e => setRange(e.target.value)}>
                        <option value="daily">Jour</option>
                        <option value="weekly">Semaine</option>
                        <option value="monthly">Mois</option>
                    </select>
                </CardHeader>
                <CardContent>
                    <section style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={userActivity || []}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label
                                >
                                    {(userActivity || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
};
