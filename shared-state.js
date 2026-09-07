(() => {
  const config = window.OVERLAY_SUPABASE_CONFIG;
  const hasConfig = config && !config.url.includes('YOUR_PROJECT') && !config.anonKey.includes('YOUR_SUPABASE');

  window.overlaySync = {
    enabled: Boolean(hasConfig),
    state: {},
    client: null,
    channel: null,
    async start(onState) {
      if (!hasConfig || !window.supabase) return;
      this.client = window.supabase.createClient(config.url, config.anonKey);
      const { data } = await this.client.from('overlay_state').select('state').eq('id', 'main').maybeSingle();
      if (data?.state) {
        this.state = data.state;
        onState(this.state);
      }
      this.channel = this.client.channel('overlay-state')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'overlay_state', filter: 'id=eq.main' }, (payload) => {
          if (payload.new?.state) {
            this.state = payload.new.state;
            onState(this.state);
          }
        })
        .subscribe();
    },
    async save(nextState) {
      if (!this.enabled || !this.client) return;
      this.state = nextState;
      await this.client.from('overlay_state').upsert({ id: 'main', state: nextState, updated_at: new Date().toISOString() });
    }
  };
})();
