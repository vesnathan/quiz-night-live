'use client';

import { useState } from 'react';
import { Card, CardBody, Input, Textarea, Button } from '@nextui-org/react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Implement actual form submission to backend
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
          <p className="text-gray-400 mb-8">
            Have a question, feedback, or just want to say hello? We&apos;d love to hear from you!
          </p>

          <Card className="bg-gray-800/50 backdrop-blur">
            <CardBody className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  isRequired
                  classNames={{
                    input: 'bg-gray-700/50',
                    inputWrapper: 'bg-gray-700/50',
                  }}
                />
                <Input
                  type="email"
                  label="Email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  isRequired
                  classNames={{
                    input: 'bg-gray-700/50',
                    inputWrapper: 'bg-gray-700/50',
                  }}
                />
                <Input
                  label="Subject"
                  placeholder="What's this about?"
                  value={formData.subject}
                  onChange={handleChange('subject')}
                  isRequired
                  classNames={{
                    input: 'bg-gray-700/50',
                    inputWrapper: 'bg-gray-700/50',
                  }}
                />
                <Textarea
                  label="Message"
                  placeholder="Tell us more..."
                  value={formData.message}
                  onChange={handleChange('message')}
                  isRequired
                  minRows={4}
                  classNames={{
                    input: 'bg-gray-700/50',
                    inputWrapper: 'bg-gray-700/50',
                  }}
                />

                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
                    Thank you for your message! We&apos;ll get back to you soon.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
                    Something went wrong. Please try again later.
                  </div>
                )}

                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full font-semibold"
                  isLoading={isSubmitting}
                >
                  Send Message
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
