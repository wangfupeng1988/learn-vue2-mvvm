
import { nextTick } from '../util/index'

const queue: Array<Watcher> = []

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */
 export function queueWatcher (watcher: Watcher) {

 }