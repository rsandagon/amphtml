/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {buildUrl} from '../../../ads/google/a4a/url-builder';
import {documentInfoForDoc} from '../../../src/services';
import {parseUrl} from '../../../src/url';
import {viewportForDoc} from '../../../src/services';


/**
 * An interface intended to be implemented by any ad-networks wishing to support
 * amp-auto-ads.
 * @interface
 */
class AdNetworkConfigDef {

  /**
   * @return {string}
   */
  getConfigUrl() {}

  /**
   * Any attributes derived from either the page or the auto-amp-ads tag that
   * should be applied to any ads inserted.
   * @return {!Object<string, string>}
   */
  getAttributes() {}

  /**
   * Network specific constraints on the placement of ads on the page.
   * @return {!./ad-tracker.AdConstraints}
   */
  getAdConstraints() {}
}

/**
 * Builds and returns an AdNetworkConfig instance for the given type.
 * @param {string} type
 * @param {!Element} autoAmpAdsElement
 * @return {?AdNetworkConfigDef}
 */
export function getAdNetworkConfig(type, autoAmpAdsElement) {
  if (type == 'adsense') {
    return new AdSenseNetworkConfig(autoAmpAdsElement);
  }
  return null;
}

/**
 * @implements {AdNetworkConfigDef}
 */
class AdSenseNetworkConfig {
  /**
   * @param {!Element} autoAmpAdsElement
   */
  constructor(autoAmpAdsElement) {
    this.autoAmpAdsElement_ = autoAmpAdsElement;
  }

  /** @override */
  getConfigUrl() {
    const docInfo = documentInfoForDoc(this.autoAmpAdsElement_);
    const canonicalHostname = parseUrl(docInfo.canonicalUrl).hostname;
    return buildUrl('//pagead2.googlesyndication.com/getconfig/ama', [
      {
        name: 'client',
        value: this.autoAmpAdsElement_.getAttribute('data-ad-client'),
      },
      {
        name: 'plah',
        value: canonicalHostname},
      {name: 'ama_t', value: 'amp'},
    ], 4096);
  }

  /** @override */
  getAttributes() {
    return {
      'type': 'adsense',
      'data-ad-client': this.autoAmpAdsElement_.getAttribute('data-ad-client'),
    };
  }

  /** @override */
  getAdConstraints() {
    const viewportHeight =
        viewportForDoc(this.autoAmpAdsElement_).getSize().height;
    return {
      initialMinSpacing: viewportHeight,
      subsequentMinSpacing: [
        {adCount: 3, spacing: viewportHeight * 2},
        {adCount: 6, spacing: viewportHeight * 3},
      ],
      maxAdCount: 8,
    };
  }
}
