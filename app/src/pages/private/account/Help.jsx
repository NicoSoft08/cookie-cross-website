import { FileText, HelpCircle, Inbox, LifeBuoy, MessageSquare, Plus, Search } from "lucide-react";
import Button from "../../../components/ui/Button";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/Card";
import { formatDate } from "../../../lib/utils";
import Badge from "../../../components/ui/Badge";
import '../../../styles/account/Help.scss';

export default function Help() {
    const [showNewTicketForm, setShowNewTicketForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [tickets, setTickets] = useState([
        {
            id: 'ticket_001',
            subject: 'Unable to update profile information',
            date: '2023-11-10T13:45:00.000Z',
            status: 'closed',
            lastUpdated: '2023-11-12T09:30:00.000Z',
            category: 'Account Issues',
        },
        {
            id: 'ticket_002',
            subject: 'Billing discrepancy on recent payment',
            date: '2023-10-28T15:20:00.000Z',
            status: 'in_progress',
            lastUpdated: '2023-11-01T11:15:00.000Z',
            category: 'Billing',
        },
        {
            id: 'ticket_003',
            subject: 'Feature request: Dark mode support',
            date: '2023-10-15T10:10:00.000Z',
            status: 'open',
            lastUpdated: '2023-10-15T10:10:00.000Z',
            category: 'Feature Request',
        },
    ]);

    const filteredTickets = tickets.filter(ticket =>
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="account-help">
            <Button
                variant="outline"
                className="account-help__new-ticket-button"
                icon={<Plus size={16} />}
                onClick={() => setShowNewTicketForm(true)}
            >
                Nouveau Ticket
            </Button>

            {/* Quick help cards */}
            <div className="quick-help-grid">
                <QuickHelpCard
                    title="FAQs & Guides"
                    icon={<FileText size={24} className="quick-help-icon" />}
                    description="Trouvez des réponses aux questions les plus fréquemment posées et explorez des guides détaillés pour une expérience optimale."
                />
                <QuickHelpCard
                    title="Contact Support"
                    icon={<MessageSquare size={24} className="quick-help-icon" />}
                    description="Obtenez de l'aide immédiate et résolvez vos problèmes avec notre équipe d'assistance disponible 24/7."
                />
                <QuickHelpCard
                    title="Community Forums"
                    icon={<HelpCircle size={24} className="quick-help-icon" />}
                    description="Partagez vos idées, posez des questions et interagissez avec d'autres utilisateurs pour obtenir des conseils et des solutions."
                />
            </div>

            {/* New ticket form */}
            {showNewTicketForm && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex-items-center">
                            <Plus size={18} className="mr-2" />
                            Créer un nouveau ticket
                        </CardTitle>
                        <CardDescription>
                            Vous pouvez créer un nouveau ticket en remplissant le formulaire ci-dessous.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Objet
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Briève description de votre problème"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                        Catégorie
                                    </label>
                                    <select
                                        id="category"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Choisissez une catégorie</option>
                                        <option value="Account Issues">Problèmes de Compte</option>
                                        <option value="Billing">Facturation</option>
                                        <option value="Technical Issues">Problèmes Techniques</option>
                                        <option value="Feature Request">Demande de Fonctionnalité</option>
                                        <option value="Other">Autre</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={5}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Veuillez fournir des détails sur votre problème ou votre demande"
                                    ></textarea>
                                </div>

                                <div>
                                    <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                                       Pièces jointes (facultatif)
                                    </label>
                                    <div className="border-border-dashed border-gray-300 rounded-md p-4 text-center">
                                        <input
                                            type="file"
                                            id="attachment"
                                            className="hidden"
                                            multiple
                                            hidden
                                        />
                                        <label htmlFor="attachment" className="cursor-pointer text-sm text-gray-600">
                                            <span className="text-primary-600 font-medium">Cliquez pour télécharger</span> ou glisser-déposer des fichiers ici
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-justify-end space-x-3">
                        <Button
                            variant="outline"
                            className="btn cancel"
                            onClick={() => setShowNewTicketForm(false)}
                        >
                            Annuler
                        </Button>
                        <Button className="btn submit">Envoyer</Button>
                    </CardFooter>
                </Card>
            )}

            {/* Support tickets */}
            <Card className='support'>
                <CardHeader>
                    <div className="support-header">
                        <CardTitle className="support-title">
                            <Inbox size={18} className="support-title__icon" />
                            Your Support Tickets
                        </CardTitle>
                        <div className="support-search">
                            <Search className="support-search__icon" size={16} />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                className="support-search__input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="support-content">
                    {filteredTickets.length > 0 ? (
                        <div className="support-list">
                            {filteredTickets.map(ticket => (
                                <div key={ticket.id} className="support-item">
                                    <div className="support-item__content">
                                        <div>
                                            <div className="__header">
                                                <p className="__subject">{ticket.subject}</p>
                                                <Badge
                                                    variant={
                                                        ticket.status === 'open'
                                                            ? 'primary'
                                                            : ticket.status === 'in_progress'
                                                                ? 'warning'
                                                                : 'success'
                                                    }
                                                    size="sm"
                                                    className={
                                                        ticket.status === 'open'
                                                            ? '__badge--open'
                                                            : ticket.status === 'in_progress'
                                                                ? '__badge--in-progress'
                                                                : '__badge--resolved'
                                                    }
                                                >
                                                    {ticket.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <div className="__meta">
                                                <span>Ticket #{ticket.id.split('_')[1]}</span>
                                                <span>Category: {ticket.category}</span>
                                                <span>Created: {formatDate(ticket.date)}</span>
                                            </div>
                                            <p className="__update">
                                                Last updated {formatDate(ticket.lastUpdated)}
                                            </p>
                                        </div>
                                        <div className="support-item__actions">
                                            <Button className="btn" variant="outline" size="sm">View Details</Button>
                                            {ticket.status !== 'closed' && (
                                                <Button className="btn" variant="outline" size="sm">Close Ticket</Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="support-empty">
                            <LifeBuoy size={40} className="support-empty__icon" />
                            <p className="support-empty__text">
                                Aucun ticket trouvé.
                            </p>
                            {searchQuery && (
                                <p className="support-empty__subtext">
                                    Essayez de rechercher avec d'autres mots-clés.
                                </p>
                            )}
                            <Button className="support-empty__button" onClick={() => setShowNewTicketForm(true)}>
                                Nouveau Ticket
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const QuickHelpCard = ({ title, icon, description }) => {
    return (
        <Card className="quick-help-card">
            <CardContent className="quick-help-card__content">
                <div className="quick-help-card__inner">
                    <div className="quick-help-card__icon">{icon}</div>
                    <h3 className="quick-help-card__title">{title}</h3>
                    <p className="quick-help-card__description">{description}</p>
                    <Button variant="ghost" className="quick-help-card__button">Voir</Button>
                </div>
            </CardContent>
        </Card>
    );
};
