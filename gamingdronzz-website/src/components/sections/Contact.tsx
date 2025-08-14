import React, { useEffect, useRef, useState } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import './Contact.css';

interface ContactMethod {
    icon: string;
    title: string;
    value: string;
    action: string;
    description?: string;
}

interface ContactFormData {
    name: string;
    email: string;
    company: string;
    projectType: string;
    budget: string;
    message: string;
}

interface ContactProps {
    showForm?: boolean;
    customMethods?: ContactMethod[];
}

const defaultContactMethods: ContactMethod[] = [
    {
        icon: '📧',
        title: 'Email',
        value: 'hello@gamingdronzz.com',
        action: 'mailto:hello@gamingdronzz.com?subject=Project Inquiry',
        description: 'Drop us a line anytime'
    },
    {
        icon: '📞',
        title: 'Phone',
        value: '+1 (555) 123-4567',
        action: 'tel:+15551234567',
        description: 'Mon-Fri 9AM-6PM EST'
    },
    {
        icon: '💬',
        title: 'Live Chat',
        value: 'Chat with us',
        action: '#',
        description: 'Get instant answers'
    },
    {
        icon: '📍',
        title: 'Location',
        value: 'Remote Worldwide',
        action: '#',
        description: 'Global game development'
    }
];

const Contact: React.FC<ContactProps> = ({
    showForm = true,
    customMethods
}) => {
    const contactRef = useRef<HTMLElement>(null);
    const { setCurrentSection } = useContentManager();
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        company: '',
        projectType: '',
        budget: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [visibleItems, setVisibleItems] = useState<number[]>([]);

    const contactMethods = customMethods || defaultContactMethods;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setCurrentSection('contact');
                    // Trigger staggered animations
                    contactMethods.forEach((_, index) => {
                        setTimeout(() => {
                            setVisibleItems(prev => [...prev, index]);
                        }, index * 150);
                    });
                }
            },
            { threshold: 0.3 }
        );

        if (contactRef.current) {
            observer.observe(contactRef.current);
        }

        return () => observer.disconnect();
    }, [setCurrentSection, contactMethods]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            // Simulate form submission - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Form submitted:', formData);
            setSubmitStatus('success');
            setFormData({
                name: '',
                email: '',
                company: '',
                projectType: '',
                budget: '',
                message: ''
            });
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContactMethod = (action: string): void => {
        if (action.startsWith('mailto:') || action.startsWith('tel:')) {
            window.location.href = action;
        } else if (action === '#') {
            console.log('Opening live chat or location...');
        }
    };

    return (
        <section
            ref={contactRef}
            id="contact"
            className="contact"
            aria-label="Contact section"
        >
            <div className="contact__container">
                {/* Header */}
                <div className="contact__header">
                    <div className="contact__header-badge">
                        <span className="contact__header-badge-icon">🚀</span>
                        <span className="contact__header-badge-text">Let's Build Together</span>
                    </div>
                    <h2 className="contact__title">Ready to Start Your Project?</h2>
                    <p className="contact__subtitle">
                        Transform your gaming vision into reality. Our expert team is here to guide you
                        through every step of the development process.
                    </p>
                </div>

                <div className="contact__content">
                    {/* Contact Methods Grid */}
                    <div className="contact__methods">
                        <div className="contact__methods-header">
                            <h3 className="contact__methods-title">Get in Touch</h3>
                            <p className="contact__methods-subtitle">Choose your preferred way to connect</p>
                        </div>

                        <div className="contact__methods-grid">
                            {contactMethods.map((method, index) => (
                                <div
                                    key={index}
                                    className={`contact__method ${visibleItems.includes(index) ? 'contact__method--visible' : ''}`}
                                    onClick={() => handleContactMethod(method.action)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleContactMethod(method.action);
                                        }
                                    }}
                                    style={{ '--delay': `${index * 0.1}s` } as React.CSSProperties}
                                >
                                    <div className="contact__method-icon">
                                        <span className="contact__method-icon-bg"></span>
                                        <span className="contact__method-icon-text">{method.icon}</span>
                                    </div>
                                    <div className="contact__method-content">
                                        <h4 className="contact__method-title">{method.title}</h4>
                                        <p className="contact__method-value">{method.value}</p>
                                        {method.description && (
                                            <p className="contact__method-description">{method.description}</p>
                                        )}
                                    </div>
                                    <div className="contact__method-arrow">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    {showForm && (
                        <div className="contact__form-section">
                            <div className="contact__form-header">
                                <h3 className="contact__form-title">Tell Us About Your Project</h3>
                                <p className="contact__form-subtitle">Fill out the form below and we'll get back to you within 24 hours</p>
                            </div>

                            <form className="contact__form" onSubmit={handleSubmit}>
                                <div className="contact__form-grid">
                                    <div className="contact__form-group">
                                        <label className="contact__form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="contact__form-input"
                                            required
                                        />
                                    </div>

                                    <div className="contact__form-group">
                                        <label className="contact__form-label">Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="contact__form-input"
                                            required
                                        />
                                    </div>

                                    <div className="contact__form-group">
                                        <label className="contact__form-label">Company</label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            className="contact__form-input"
                                        />
                                    </div>

                                    <div className="contact__form-group">
                                        <label className="contact__form-label">Project Type *</label>
                                        <select
                                            name="projectType"
                                            value={formData.projectType}
                                            onChange={handleInputChange}
                                            className="contact__form-select"
                                            required
                                        >
                                            <option value="">Select project type</option>
                                            <option value="mobile-game">Mobile Game Development</option>
                                            <option value="pc-game">PC Game Development</option>
                                            <option value="console-game">Console Game Development</option>
                                            <option value="vr-ar">VR/AR Experience</option>
                                            <option value="consulting">Game Development Consulting</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="contact__form-group">
                                        <label className="contact__form-label">Budget Range</label>
                                        <select
                                            name="budget"
                                            value={formData.budget}
                                            onChange={handleInputChange}
                                            className="contact__form-select"
                                        >
                                            <option value="">Select budget range</option>
                                            <option value="under-10k">Under $10,000</option>
                                            <option value="10k-50k">$10,000 - $50,000</option>
                                            <option value="50k-100k">$50,000 - $100,000</option>
                                            <option value="100k-500k">$100,000 - $500,000</option>
                                            <option value="over-500k">Over $500,000</option>
                                        </select>
                                    </div>

                                    <div className="contact__form-group contact__form-group--full">
                                        <label className="contact__form-label">Project Description *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            className="contact__form-textarea"
                                            rows={6}
                                            placeholder="Tell us about your project goals, timeline, and any specific requirements..."
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="contact__form-submit">
                                    <button
                                        type="submit"
                                        className="contact__form-button"
                                        disabled={isSubmitting}
                                    >
                                        <span className="contact__form-button-text">
                                            {isSubmitting ? 'Sending Message...' : 'Send Message'}
                                        </span>
                                        {!isSubmitting && (
                                            <span className="contact__form-button-icon">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M2 8L14 8M14 8L8 2M14 8L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </span>
                                        )}
                                    </button>

                                    {submitStatus === 'success' && (
                                        <div className="contact__form-status contact__form-status--success">
                                            <div className="contact__form-status-icon">✓</div>
                                            <div className="contact__form-status-content">
                                                <p className="contact__form-status-title">Message sent successfully!</p>
                                                <p className="contact__form-status-text">We'll get back to you within 24 hours.</p>
                                            </div>
                                        </div>
                                    )}

                                    {submitStatus === 'error' && (
                                        <div className="contact__form-status contact__form-status--error">
                                            <div className="contact__form-status-icon">⚠</div>
                                            <div className="contact__form-status-content">
                                                <p className="contact__form-status-title">Something went wrong</p>
                                                <p className="contact__form-status-text">Please try again or contact us directly.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* CTA Section */}
                <div className="contact__cta">
                    <div className="contact__cta-background"></div>
                    <div className="contact__cta-content">
                        <div className="contact__cta-text">
                            <h3 className="contact__cta-title">Let's Create Something Amazing</h3>
                            <p className="contact__cta-subtitle">
                                Join hundreds of satisfied clients who have brought their gaming visions to life with us.
                            </p>
                        </div>
                        <div className="contact__cta-actions">
                            <button
                                className="contact__cta-button contact__cta-button--primary"
                                onClick={() => handleContactMethod('mailto:hello@gamingdronzz.com?subject=Project Inquiry')}
                            >
                                <span>Start Your Project</span>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M2 8L14 8M14 8L8 2M14 8L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button
                                className="contact__cta-button contact__cta-button--secondary"
                                onClick={() => handleContactMethod('tel:+15551234567')}
                            >
                                Schedule a Call
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;