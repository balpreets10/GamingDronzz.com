import React, { useEffect, useRef, useState } from 'react';
import { useContentManager } from '../../hooks/useContentManager';
import './Contact.css';

interface ContactMethod {
    icon: string;
    title: string;
    value: string;
    action: string;
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
        title: 'Email Us',
        value: 'hello@gamingdronzz.com',
        action: 'mailto:hello@gamingdronzz.com?subject=Project Inquiry'
    },
    {
        icon: '📞',
        title: 'Call Us',
        value: '+1 (555) 123-4567',
        action: 'tel:+15551234567'
    },
    {
        icon: '💬',
        title: 'Live Chat',
        value: 'Available Mon-Fri 9AM-6PM',
        action: '#'
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

    const contactMethods = customMethods || defaultContactMethods;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setCurrentSection('contact');
                }
            },
            { threshold: 0.3 }
        );

        if (contactRef.current) {
            observer.observe(contactRef.current);
        }

        return () => observer.disconnect();
    }, [setCurrentSection]);

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
            // Implement live chat logic
            console.log('Opening live chat...');
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
                <div className="contact__header">
                    <h2 className="contact__title">Get In Touch</h2>
                    <p className="contact__subtitle">
                        Ready to start your next gaming project? We'd love to hear from you and discuss
                        how we can bring your vision to life.
                    </p>
                </div>

                <div className="contact__content">
                    <div className="contact__methods">
                        <h3 className="contact__methods-title">Contact Methods</h3>
                        <div className="contact__methods-grid">
                            {contactMethods.map((method, index) => (
                                <div
                                    key={index}
                                    className="contact__method"
                                    onClick={() => handleContactMethod(method.action)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            handleContactMethod(method.action);
                                        }
                                    }}
                                >
                                    <div className="contact__method-icon">{method.icon}</div>
                                    <div className="contact__method-content">
                                        <h4 className="contact__method-title">{method.title}</h4>
                                        <p className="contact__method-value">{method.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {showForm && (
                        <div className="contact__form-wrapper">
                            <h3 className="contact__form-title">Send us a message</h3>
                            <form className="contact__form" onSubmit={handleSubmit}>
                                <div className="contact__form-group">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Your Name *"
                                        className="contact__form-input"
                                        required
                                    />
                                </div>

                                <div className="contact__form-group">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Your Email *"
                                        className="contact__form-input"
                                        required
                                    />
                                </div>

                                <div className="contact__form-group">
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        placeholder="Company Name"
                                        className="contact__form-input"
                                    />
                                </div>

                                <div className="contact__form-group">
                                    <select
                                        name="projectType"
                                        value={formData.projectType}
                                        onChange={handleInputChange}
                                        className="contact__form-select"
                                        required
                                    >
                                        <option value="">Project Type *</option>
                                        <option value="mobile-game">Mobile Game</option>
                                        <option value="pc-game">PC Game</option>
                                        <option value="console-game">Console Game</option>
                                        <option value="vr-ar">VR/AR Experience</option>
                                        <option value="consulting">Consulting</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="contact__form-group">
                                    <select
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        className="contact__form-select"
                                    >
                                        <option value="">Budget Range</option>
                                        <option value="under-10k">Under $10,000</option>
                                        <option value="10k-50k">$10,000 - $50,000</option>
                                        <option value="50k-100k">$50,000 - $100,000</option>
                                        <option value="100k-500k">$100,000 - $500,000</option>
                                        <option value="over-500k">Over $500,000</option>
                                    </select>
                                </div>

                                <div className="contact__form-group contact__form-group--full">
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="Tell us about your project *"
                                        className="contact__form-textarea"
                                        rows={5}
                                        required
                                    />
                                </div>

                                <div className="contact__form-submit">
                                    <button
                                        type="submit"
                                        className="contact__form-button"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Message'}
                                    </button>

                                    {submitStatus === 'success' && (
                                        <p className="contact__form-status contact__form-status--success">
                                            Message sent successfully! We'll get back to you soon.
                                        </p>
                                    )}

                                    {submitStatus === 'error' && (
                                        <p className="contact__form-status contact__form-status--error">
                                            Sorry, there was an error sending your message. Please try again.
                                        </p>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <div className="contact__cta">
                    <div className="contact__cta-content">
                        <h3 className="contact__cta-title">Ready to get started?</h3>
                        <p className="contact__cta-text">
                            Let's discuss your project and see how we can help bring your gaming vision to life.
                        </p>
                        <div className="contact__cta-buttons">
                            <button
                                className="contact__cta-button contact__cta-button--primary"
                                onClick={() => handleContactMethod('mailto:hello@gamingdronzz.com?subject=Project Inquiry')}
                            >
                                Start Your Project
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