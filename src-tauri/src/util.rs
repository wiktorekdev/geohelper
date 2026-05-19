use std::borrow::Borrow;
use std::collections::HashMap;
use std::collections::HashSet;
use std::collections::VecDeque;
use std::hash::Hash;

pub struct LimitedSet<T: Eq + Hash + Clone> {
    limit: usize,
    order: VecDeque<T>,
    items: HashSet<T>,
}

impl<T: Eq + Hash + Clone> LimitedSet<T> {
    pub fn new(limit: usize) -> Self {
        Self {
            limit,
            order: VecDeque::with_capacity(limit),
            items: HashSet::with_capacity(limit),
        }
    }

    pub fn contains<Q>(&self, v: &Q) -> bool
    where
        T: Borrow<Q>,
        Q: Eq + Hash + ?Sized,
    {
        self.items.contains(v)
    }

    pub fn insert(&mut self, v: T) {
        if self.items.contains(&v) {
            return;
        }
        self.items.insert(v.clone());
        self.order.push_back(v);
        while self.order.len() > self.limit {
            if let Some(old) = self.order.pop_front() {
                self.items.remove(&old);
            }
        }
    }

    pub fn clear(&mut self) {
        self.order.clear();
        self.items.clear();
    }
}

pub struct LimitedMap<K: Eq + Hash + Clone, V: Clone> {
    limit: usize,
    order: VecDeque<K>,
    items: HashMap<K, V>,
}

impl<K: Eq + Hash + Clone, V: Clone> LimitedMap<K, V> {
    pub fn new(limit: usize) -> Self {
        Self {
            limit,
            order: VecDeque::with_capacity(limit),
            items: HashMap::with_capacity(limit),
        }
    }

    pub fn get(&self, k: &K) -> Option<V> {
        self.items.get(k).cloned()
    }

    pub fn insert(&mut self, k: K, v: V) {
        if !self.items.contains_key(&k) {
            self.order.push_back(k.clone());
        }
        self.items.insert(k, v);
        while self.order.len() > self.limit {
            if let Some(old) = self.order.pop_front() {
                self.items.remove(&old);
            }
        }
    }
}

pub fn is_portable() -> bool {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(exe_dir) = exe_path.parent() {
            return exe_dir.join("portable").exists() || exe_dir.join("data").is_dir();
        }
    }
    false
}
