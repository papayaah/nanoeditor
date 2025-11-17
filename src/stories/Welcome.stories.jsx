export default {
  title: 'Welcome',
  parameters: {
    layout: 'centered',
  },
};

export const Introduction = () => (
  <div style={{ maxWidth: '800px', padding: '40px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
    <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>Nano Editor Components</h1>
    
    <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '30px' }}>
      Welcome to the Nano Editor component library! This Storybook showcases the two main components 
      that power the Nano Editor application.
    </p>

    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>📝 DocumentEditor</h2>
      <p style={{ marginBottom: '10px' }}>A rich text document editor built with BlockNote, featuring:</p>
      <ul style={{ color: '#374151', lineHeight: '1.8' }}>
        <li>Full rich text formatting (bold, italic, underline, etc.)</li>
        <li>AI-powered writing assistance using Chrome's built-in AI</li>
        <li>Rewrite selected text with different tones</li>
        <li>Continue writing from your cursor position</li>
        <li>PDF and Markdown export</li>
        <li>Image upload support</li>
        <li>Dark mode support</li>
      </ul>
      <p style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
        <strong>Use Cases:</strong> Blog post writing, documentation, note-taking, long-form content creation
      </p>
    </section>

    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>📱 PostCreator</h2>
      <p style={{ marginBottom: '10px' }}>An AI-powered social media post generator that creates multiple variations:</p>
      <ul style={{ color: '#374151', lineHeight: '1.8' }}>
        <li>Generate 3 unique post variations from a single prompt</li>
        <li>Customize tone (casual, neutral, formal)</li>
        <li>Choose format (markdown, plain text)</li>
        <li>Select length (short, medium, long)</li>
        <li>Apply styles (humorous, professional, inspirational, etc.)</li>
        <li>Track submission history</li>
        <li>Regenerate with different settings</li>
        <li>Dark mode support</li>
      </ul>
      <p style={{ marginTop: '10px', fontSize: '14px', color: '#6b7280' }}>
        <strong>Use Cases:</strong> Social media content creation, marketing copy, quick announcements, engagement posts
      </p>
    </section>

    <section style={{ marginBottom: '40px', padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fbbf24' }}>
      <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#92400e' }}>⚠️ Requirements</h3>
      <p style={{ color: '#92400e', margin: 0 }}>
        Both components require <strong>Chrome browser with built-in AI APIs enabled</strong>:
      </p>
      <ul style={{ color: '#92400e', marginTop: '10px', marginBottom: 0 }}>
        <li>Chrome Canary or Chrome Dev</li>
        <li>Enable AI features in chrome://flags</li>
        <li>Prompt API and Rewriter API must be available</li>
      </ul>
    </section>

    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>Getting Started</h2>
      <p style={{ marginBottom: '15px' }}>
        Browse the stories in the sidebar to see each component in action. Each story includes:
      </p>
      <ul style={{ color: '#374151', lineHeight: '1.8' }}>
        <li>Live interactive examples</li>
        <li>Different configurations and use cases</li>
        <li>Code examples for integration</li>
      </ul>
    </section>

    <section>
      <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>Features</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
          <strong>🏠 Local-first</strong>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '5px 0 0 0' }}>
            All data stored in IndexedDB
          </p>
        </div>
        <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
          <strong>🚀 No backend required</strong>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '5px 0 0 0' }}>
            Completely client-side
          </p>
        </div>
        <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
          <strong>🤖 AI-powered</strong>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '5px 0 0 0' }}>
            Leverages Chrome's built-in AI
          </p>
        </div>
        <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
          <strong>♿ Accessible</strong>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '5px 0 0 0' }}>
            Built with accessibility in mind
          </p>
        </div>
      </div>
    </section>
  </div>
);
